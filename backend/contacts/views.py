from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Contact
from .serializers import ContactSerializer
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def contact_list_create(request):
    if request.method == 'GET':
        contacts = Contact.objects.filter(owner=request.user)
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        existing_contact = Contact.objects.filter(
            owner=request.user,
            email=request.data.get('email')
        ).exists()

        if existing_contact:
            return Response({'error': 'email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ContactSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                owner=request.user)  # Set the owner to the current user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# Create your views here.


@api_view(['PUT', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def update_delete_contact(request, contact_id):
    contact = get_object_or_404(Contact, id=contact_id, owner=request.user)
    if contact.owner != request.user:
        return Response({"detail": "Not authorized to modify this contact"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'PUT':
        existing_contact = Contact.objects.filter(
            owner=request.user,
            email=request.data.get('email')
        ).exists()

        if existing_contact:
            return Response({'error': 'email already exists.'}, status=status.HTTP_400_BAD_REQUEST)


        serializer = ContactSerializer(contact, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# @api_view(['POST'])
# @permission_classes([permissions.IsAuthenticated])
# def send_reminder(request, id):
#     contacts_to_remind = Contact.objects.filter(owner=request.user)
#     print("reach here?")
#     for contact in contacts_to_remind:
#         print(contact)
#         send_mail(
#             'Meeting Reminder',
#             'This is a reminder to provide the requested information.',
#             'abamakabaka@yahoo.com',
#             [contact.email],
#             fail_silently=False,
#         )
#     return Response({"message": "Reminders sent successfully"},
#                     status=status.HTTP_200_OK)
