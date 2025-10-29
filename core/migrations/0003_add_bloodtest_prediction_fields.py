from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_hospitaluser_last_login'),
    ]

    operations = [
        migrations.AddField(
            model_name='bloodtest',
            name='prediction_summary',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='bloodtest',
            name='prediction_findings',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='bloodtest',
            name='prediction_conditions',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='bloodtest',
            name='prediction_recommendations',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='bloodtest',
            name='prediction_disclaimer',
            field=models.TextField(blank=True, null=True),
        ),
    ]
