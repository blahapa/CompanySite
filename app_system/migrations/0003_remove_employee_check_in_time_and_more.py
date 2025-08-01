# Generated by Django 5.2.2 on 2025-06-16 01:42

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_system', '0002_employee_check_in_time_employee_check_out_time_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='employee',
            name='check_in_time',
        ),
        migrations.RemoveField(
            model_name='employee',
            name='check_out_time',
        ),
        migrations.CreateModel(
            name='AttendanceRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('check_in_time', models.DateTimeField()),
                ('check_out_time', models.DateTimeField(blank=True, null=True)),
                ('date', models.DateField(editable=False)),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attendance_records', to='app_system.employee')),
            ],
            options={
                'ordering': ['-check_in_time'],
            },
        ),
    ]
