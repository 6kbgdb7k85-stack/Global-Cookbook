from marshmallow import Schema, fields, validate, ValidationError, validates

from models import *


class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.String(required=True,error_messages={"required":"Username is required"})
    email = fields.Email(required=True,error_messages={"required":"Email is required"})
    password = fields.String(
        load_only=True,
        validate=[
            validate.Length(
                min=8,
                max=25,
                error="Password must be between 8 and 25 characters long.",
            ),
            validate.Regexp(
                r".*[0-9]", error="Password must contain at least one number."
            ),
            validate.Regexp(
                r".*[A-Z]", error="Password must contain at least one capital letter."
            ),
            validate.Regexp(
                r".*[a-z]", error="Password must contain at least one lower case letter."
            ),
            validate.Regexp(
                r".*[^a-zA-Z0-9\s]",
                error="Password must contain at least one special character.",
            ),
        ],
        required=True
    )
    recipe_default_private = fields.Bool(load_default=False)

    blocked_users = fields.List(fields.Nested(lambda: UserSchema(only=("username",))))
    blocked_by_users = fields.List(
        fields.Nested(lambda: UserSchema(only=("username",)))
    )

    recipes = fields.List(
        fields.Nested(lambda: RecipeSchema(exclude=("user", "comments")))
    )
    favorite_recipes = fields.List(
        fields.Nested(lambda: RecipeSchema(exclude=("favorite_users", "comments")))
    )
    comments = fields.List(fields.Nested(lambda:CommentSchema(exclude=("user",))))

    @validates("username")
    def validate_unique_username(self, username, **kwargs):
        if User.query.filter(User.username == username).first():
            raise ValidationError(f'Username "{username}" is already taken.')

    @validates("email")
    def validate_unique_email(self, email, **kwargs):
        if User.query.filter(User.email == email).first():
            raise ValidationError(
                f'There is already an account associated with "{email}".'
            )


class RecipeSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.String(required=True)
    description = fields.String()
    ingredients = fields.String()
    instructions = fields.String()
    private = fields.Boolean()
    created_time = fields.DateTime(dump_only=True)

    user = fields.Nested(lambda: UserSchema(exclude=("recipes", "comments")))
    favoriteUsers = fields.List(
        fields.Nested(lambda: UserSchema(exclude=("favorite_recipes", "comments")))
    )
    comments = fields.List(fields.Nested(lambda: CommentSchema(exclude=("user", "recipe"))))


class CommentSchema(Schema):
    id = fields.Int(dump_only=True)
    text = fields.String()
    created_time = fields.DateTime(dump_only=True)

    recipe = fields.Nested(lambda: RecipeSchema(exclude=("comments", "user")))
    user = fields.Nested(lambda: UserSchema(exclude=("recipes", "comments")))
