import os
from flask import request, make_response, jsonify, redirect, url_for, abort
from flask_jwt_extended import (
    verify_jwt_in_request,
    get_jwt_identity,
    create_access_token,
)
from flask_restful import Resource
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from marshmallow import EXCLUDE, ValidationError
from werkzeug.exceptions import NotFound, InternalServerError

from config import app, db, api
from models import *
from schemas import *
from constants import (
    OPEN_ROUTES,
    ERROR_TYPES,
    USER_ENDPOINTS,
    USER_RESOURCES,
)


def force_native_flask_errors(e):
    raise e


api.handle_error = force_native_flask_errors
api.error_router = lambda self, handler, e: handler(e)


@app.errorhandler(ValidationError)
def handle_validation_error(error):
    return make_response({ERROR_TYPES.FIELD_ERROR: error.messages}, 422)


@app.errorhandler(IntegrityError)
def handle_integrity_error(error):
    db.session.rollback()
    app.logger.exception(error)
    return make_response(
        {ERROR_TYPES.ERROR: "Provided data violates database constraints."}, 400
    )


@app.errorhandler(NotFound)
def handle_404(e):
    return make_response({ERROR_TYPES.ERROR: e.description}, 404)


@app.errorhandler(InternalServerError)
def handle_500(e):
    app.logger.exception(e)
    return make_response(
        {ERROR_TYPES.ERROR: "Something went wrong on the server."}, 500
    )


@app.before_request
def check_logged_in():
    if request.method == "OPTIONS":
        return None
    if request.endpoint not in OPEN_ROUTES and not verify_jwt_in_request():
        return make_response({ERROR_TYPES.ERROR: "Unauthorized"}, 401)


@app.before_request
def check_permission():
    if request.method == "OPTIONS":
        return None
    if request.endpoint not in USER_ENDPOINTS:
        return None
    user_id = get_jwt_identity()
    user = User.query.filter(User.id == int(user_id)).first()
    resource_name = request.endpoint
    entity_id = request.view_args.get(f"{resource_name}_id")
    resource = USER_RESOURCES.get(resource_name, None)
    if not resource or not entity_id:
        return make_response({ERROR_TYPES.ERROR: "Bad Request"}, 400)
    entity = resource.query.filter(resource.id == entity_id).first()
    if not entity:
        abort(
            404, description=f"{request.endpoint.capitalize()} {entity_id} not found."
        )
    if request.method=="GET" and getattr(entity,"private") != True:
        return None
    if entity.user != user:
        if request.method=="GET":
            return make_response({ERROR_TYPES.ERROR:"Forbidden","action":"render-access-denied"},403)
        return make_response({ERROR_TYPES.ERROR: "Forbidden"}, 403)


class Login(Resource):
    def post(self):
        email = request.get_json().get("email")
        password = request.get_json().get("password")
        if not email or not password:
            field_errors = {}
            if not email:
                field_errors["email"] = ["Email is required"]
            if not password:
                field_errors["password"] = ["Password is required"]
            return make_response({ERROR_TYPES.FIELD_ERROR: field_errors}, 422)
        user = User.query.filter(User.email == email).first()
        if user and user.authenticate(password):
            auth_token = create_access_token(identity=str(user.id))
            return make_response(
                jsonify(token=auth_token, user=UserSchema().dump(user))
            )
        else:
            return make_response(
                {ERROR_TYPES.ALERT_ERROR: "Invalid Email or Password"}, 401
            )


class Signup(Resource):

    def post(self):
        user_obj = UserSchema().load(request.get_json())
        password = user_obj.pop("password")
        user = User(**user_obj)
        user.password_hash = password
        db.session.add(user)
        db.session.commit()
        auth_token = create_access_token(identity=str(user.id))
        return make_response(jsonify(token=auth_token, user=UserSchema().dump(user)))


class CheckSession(Resource):
    def get(self):
        user = User.query.filter(User.id == get_jwt_identity()).first()
        return make_response(UserSchema().dump(user), 200)


class UserProfile(Resource):
    def dispatch_request(self, *args, **kwargs):
        user_id = kwargs["user_id"]
        self.user = User.query.filter(User.id == int(user_id)).first()
        if self.user is None:
            abort(404, description=f"User {user_id} not found")
        return super().dispatch_request(*args, **kwargs)

    def get(self, user_id):
        return make_response(UserSchema().dump(self.user), 200)

    def patch(self, user_id):
        request_body = request.get_json()
        update_data = UserSchema().load(request_body, partial=True, unknown=EXCLUDE)
        for k, v in update_data.items():
            if k == "password":
                setattr(self.user, "password_hash", v)
            else:
                setattr(self.user, k, v)
        if "unblock" in request_body:
            self.user.blocking = [
                user
                for user in self.user.blocking
                if user.id != int(request_body["unblock"])
            ]
        if "block" in request_body:
            self.user.blocking.append(
                User.query.filter(User.id == int(request_body["block"])).first()
            )
        if "favorite" in request_body:
            self.user.favorite_recipes.append(
                Recipe.query.filter(Recipe.id == int(request_body["favorite"])).first()
            )
        if "unfavorite" in request_body:
            self.user.favorite_recipes = [
                user
                for user in self.user.favorite_recipes
                if user.id != int(request_body["unfavorite"])
            ]
        db.session.commit()
        return make_response(UserSchema().dump(self.user), 200)


class RecipeList(Resource):
    def get(self):
        user_id = get_jwt_identity()
        search_text = request.args.get("text")
        search_mode = request.args.get("mode")
        recipes = Recipe.query.filter(
            Recipe.private != True or Recipe.user_id == user_id
        )
        if search_mode == "fave":
            recipes = recipes.filter(Recipe.favorite_users.any(User.id == int(user_id)))
        elif search_mode == "own":
            recipes = recipes.filter(Recipe.user_id == user_id)
        if search_text:
            recipes = recipes.filter(
                or_(
                    Recipe.name.ilike(f"%{search_text}%"),
                    Recipe.description.ilike(f"%{search_text}%"),
                    Recipe.ingredients.ilike(f"%{search_text}%"),
                )
            )
        return make_response(
            jsonify([RecipeSchema().dump(recipe) for recipe in recipes]), 200
        )

    def post(self):
        user_id = get_jwt_identity()
        user = User.query.filter(User.id == int(user_id)).first()
        validated_recipe = RecipeSchema().load(request.get_json(), unknown=EXCLUDE)
        recipe = Recipe(**validated_recipe)
        recipe.user = user
        db.session.add(recipe)
        db.session.commit()
        return make_response(RecipeSchema().dump(recipe), 201)


class RecipeView(Resource):
    def dispatch_request(self, *args, **kwargs):
        recipe_id = kwargs["recipe_id"]
        self.recipe = Recipe.query.filter(Recipe.id == recipe_id).first()
        if not self.recipe:
            abort(404, description=f"Recipe {recipe_id} not found.")
        return super().dispatch_request(*args, **kwargs)

    def get(self, recipe_id):
        return make_response(RecipeSchema().dump(self.recipe), 200)

    def patch(self, recipe_id):
        request_body = request.get_json()
        validated_data = RecipeSchema().load(
            request_body, partial=True, unknown=EXCLUDE
        )
        for k, v in validated_data.items():
            setattr(self.recipe, k, v)
        db.session.commit()
        return make_response(RecipeSchema().dump(self.recipe), 200)

    def delete(self, recipe_id):
        db.session.delete(self.recipe)
        db.session.commit()
        return make_response({}, 204)


class CommentList(Resource):
    def get(self, recipe_id):
        user_id = get_jwt_identity()
        user = User.query.filter(User.id == int(user_id)).first()
        blocked_ids = [blocked_user.id for blocked_user in user.blocking]
        comments = (
            Comment.query.filter(Comment.recipe_id == recipe_id)
            .filter(Comment.user_id.not_in(blocked_ids))
            .all()
        )
        return make_response(
            jsonify([CommentSchema().dump(comment) for comment in comments]), 200
        )

    def post(self, recipe_id):
        recipe = Recipe.query.filter(Recipe.id == recipe_id).first()
        user = User.query.filter(User.id == get_jwt_identity()).first()
        validated_comment = CommentSchema().load(request.get_json(), unknown=EXCLUDE)
        comment = Comment(**validated_comment, user=user, recipe=recipe)
        db.session.add(comment)
        db.session.commit()
        return make_response(CommentSchema().dump(comment), 201)


class CommentView(Resource):
    def dispatch_request(self, *args, **kwargs):
        comment_id = kwargs["comment_id"]
        self.comment = Comment.query.filter(Comment.id == comment_id).first()
        return super().dispatch_request(*args, **kwargs)

    def get(self, comment_id):
        return make_response(CommentSchema().dump(self.comment), 200)

    def patch(self, comment_id):
        validated_data = CommentSchema().load(
            request.get_json(), partial=True, unknown=EXCLUDE
        )
        for k, v in validated_data.items():
            setattr(self.comment, k, v)
        db.session.commit()
        return make_response(CommentSchema().dump(self.comment), 200)

    def delete(self, comment_id):
        db.session.delete(self.comment)
        db.session.commit()
        return make_response({}, 204)


api.add_resource(Login, "/login", endpoint="login")
api.add_resource(Signup, "/signup", endpoint="signup")
api.add_resource(UserProfile, "/users/<int:user_id>", endpoint="user")
api.add_resource(RecipeList, "/recipes", endpoint="recipes")
api.add_resource(RecipeView, "/recipes/<int:recipe_id>", endpoint="recipe")
api.add_resource(CommentList, "/recipes/<int:recipe_id>/comments", endpoint="comments")
api.add_resource(CommentView, "/comments/<int:comment_id>", endpoint="comment")
api.add_resource(CheckSession, "/me", endpoint="me")

if __name__ == "__main__":
    # Run the app locally in debug mode
    app.run(debug=True, port=5555)
