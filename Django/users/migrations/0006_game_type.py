from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_player_auth_42'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='game_type',
            field=models.CharField(default='default_game', max_length=30),
        ),
    ]