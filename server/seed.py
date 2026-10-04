import random as r
from datetime import datetime
from app import app
from models import *

from faker import Faker

fake = Faker()

with app.app_context():

    User.query.delete()
    Recipe.query.delete()
    Comment.query.delete()

    demo_user = User(username="demo",email="demo@demo.com")
    demo_user.password_hash="demopass1234!@A"

    demo_recipe = Recipe(name="Discount Fried Rice",description="Light-weight meal with decent protein.",ingredients="['2x Eggs','1 cup of rice', '1 cup of water', 'salt']",instructions="Cook the rice in water. When rice is done, or close to, crack the eggs into a bowl. Whisk with fork the whole mix is a shade of yellow (shade will depend on salt content) adding salt to taste. Dump the egg mix into a pan to cook. Move the eggs around the pan to minimize burning and chop into bit-sized pieces with spatula. Once cooked add eggs and rice to a bowl. Mix them together.",created_time=datetime.now(), user=demo_user)
    demo_comment = Comment(text="I tried to be funny with the name.",created_time=datetime.now(),recipe=demo_recipe,user=demo_user)

    db.session.add(demo_user)
    db.session.add(demo_recipe)
    db.session.add(demo_comment)

    if app.config.get("SQLALCHEMY_DATABASE_URI") == "sqlite:///local_development.db":
        fake_users=[]
        fake_recipes=[]
        fake_comments=[]

        fake_names=[fake.unique.first_name() for _ in range(9)]

        for i in range(9):
            user=User(username=fake_names[i],email=f"{fake_names[i]}@demo.com")
            user.password_hash=user.username+'pass1234!@A'
            fake_users.append(user)

        for i in range(19):
            recipe=Recipe(name=fake.word(),description=fake.sentence(),ingredients=fake.paragraph(),instructions=fake.paragraph(),created_time=datetime.now(),user=r.choice(fake_users))
            fake_recipes.append(recipe)

        for i in range(19):
            comment=Comment(text=fake.paragraph(),created_time=datetime.now(),user=r.choice(fake_users),recipe=r.choice(fake_recipes))
            fake_comments.append(comment)

        db.session.add_all(fake_users)
        db.session.add_all(fake_recipes)
        db.session.add_all(fake_comments)

    db.session.commit()
