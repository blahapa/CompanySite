# Generated by Django 5.2.2 on 2025-06-29 00:34

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_system', '0008_employee_date_of_birth_document'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='PerformanceReview',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(auto_now_add=True)),
                ('period', models.CharField(max_length=20)),
                ('quality_of_work', models.PositiveIntegerField()),
                ('attendance', models.PositiveIntegerField()),
                ('communication', models.PositiveIntegerField()),
                ('teamwork', models.PositiveIntegerField()),
                ('initiative', models.PositiveIntegerField()),
                ('comments', models.TextField(blank=True)),
                ('recommended_training', models.TextField(blank=True)),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app_system.employee')),
                ('reviewer', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
