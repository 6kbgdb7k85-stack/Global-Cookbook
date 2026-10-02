from datetime import datetime

from sqlalchemy.orm import validates, declared_attr
from sqlalchemy.ext.hybrid import hybrid_property

from config import db, bcrypt


# putting global prefix on tables so this project can share its database with another if needed
class GlobalCookBookModel(db.Model):
    __abstract__ = True

    @declared_attr
    def __tablename__(cls):
        return f"gcb_{cls.__name__.lower()}s"


class User(GlobalCookBookModel):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    username = db.Column(db.String, unique=True, nullable=False)
    recipe_default_private = db.Column(db.Boolean, default=False)
    _password_hash = db.Column(db.String)

    recipes = db.relationship(
        "Recipe", back_populates="user", cascade="all,delete-orphan"
    )
    comments = db.relationship("Comment", back_populates="user")
    favorite_recipes = db.relationship(
        "Recipe", secondary="gcb_favorite_recipes", back_populates="favorite_users"
    )
    blocking = db.relationship(
        "User",
        secondary="gcb_user_blocking",
        primaryjoin="User.id == gcb_user_blocking.c.user_id",
        secondaryjoin="User.id == gcb_user_blocking.c.blocking_id",
        lazy="dynamic",
        back_populates="blocked_by",
    )
    blocked_by = db.relationship(
        "User",
        secondary="gcb_user_blocking",
        primaryjoin="User.id == gcb_user_blocking.c.blocking_id",
        secondaryjoin="User.id == gcb_user_blocking.c.user_id",
        lazy="dynamic",
        back_populates="blocking",
    )

    @hybrid_property
    def password_hash(self):
        raise AttributeError("Password hash may not be viewed")

    @password_hash.setter
    def password_hash(self, password):
        p_hash = bcrypt.generate_password_hash(password.encode("utf-8"))
        self._password_hash = p_hash.decode("utf-8")

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode("utf-8"))

    def __repr__(self):
        return f"<User {self.id}, {self.username}, {self.email}, {self.recipe_default_private}>"


class UserBlocking(db.Model):
    __tablename__ = "gcb_user_blocking"
    user_id = db.Column(db.Integer, db.ForeignKey("gcb_users.id"), primary_key=True)
    blocking_id = db.Column(db.Integer, db.ForeignKey("gcb_users.id"), primary_key=True)


class Recipe(GlobalCookBookModel):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    ingredients = db.Column(db.String)
    instructions = db.Column(db.String)
    created_time = db.Column(db.DateTime, default=datetime.now())
    private = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey("gcb_users.id"))

    user = db.relationship("User", back_populates="recipes")
    comments = db.relationship(
        "Comment", back_populates="recipe", cascade="all,delete-orphan"
    )
    favorite_users = db.relationship(
        "User", secondary="gcb_favorite_recipes", back_populates="favorite_recipes"
    )

    def __repr__(self):
        return f"<Recipe {self.id}, {self.name}, {self.description}, {self.ingredients}, {self.instructions}, {self.created_time}, {self.user_id}, {self.private}>"


class Comment(GlobalCookBookModel):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String, nullable=False)
    created_time = db.Column(db.DateTime, default=datetime.now())
    recipe_id = db.Column(db.Integer, db.ForeignKey("gcb_recipes.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("gcb_users.id"), nullable=False)

    recipe = db.relationship("Recipe", back_populates="comments")
    user = db.relationship("User", back_populates="comments")

    def __repr__(self):
        return f"<Comment {self.id}, {self.text}, {self.created_time}, {self.user_id}, {self.recipe_id}>"


class FavoriteRecipe(db.Model):
    __tablename__ = "gcb_favorite_recipes"

    user_id = db.Column(db.Integer, db.ForeignKey("gcb_users.id"), primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey("gcb_recipes.id"), primary_key=True)
