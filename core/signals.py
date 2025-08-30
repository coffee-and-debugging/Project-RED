from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Donation
from django.utils import timezone

@receiver(pre_save, sender=Donation)
def update_donation_date(sender, instance, **kwargs):
    """
    Automatically set donation_date when status changes to completed
    """
    if instance.pk:
        try:
            old_instance = Donation.objects.get(pk=instance.pk)
            if old_instance.status != 'completed' and instance.status == 'completed':
                instance.donation_date = timezone.now()
        except Donation.DoesNotExist:
            pass