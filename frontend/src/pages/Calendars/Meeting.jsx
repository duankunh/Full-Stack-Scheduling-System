import './Meeting.css';
import { useState } from "react";
import api from "../../api.js";

function Meeting({ meeting, onEdit, onDelete, contacts }) {
  const [selectedContactIds, setSelectedContactIds] = useState([]);

  const toggleSelectContact = (contactId) => {
    // Check if the clicked contact is already selected
    const isSelected = selectedContactIds.includes(contactId);

    if (isSelected) {
      // If selected, remove the contact from selectedContactIds
      setSelectedContactIds(selectedContactIds.filter(id => id !== contactId));
    } else {
      // If not selected, add the contact to selectedContactIds
      setSelectedContactIds([...selectedContactIds, contactId]);
    }
  };

  const handleInviteContact = async () => {
    if (selectedContactIds.length === 0) {
      alert("Please select at least one contact to invite.");
      return;
    }

    try {
      const invitePromises = selectedContactIds.map(async (contactId) => {
        const inviteResponse = await api.get(`/scheduler/meetings/${meeting.id}/invite/${contactId}/`);
        if (inviteResponse.status !== 200) {
          throw new Error("Failed to send invitation.");
        }
        return inviteResponse.data;
      });
      await Promise.all(invitePromises);
      alert("Invitations sent successfully.");
    } catch (error) {
      console.error("Error during the invitation process:", error);
      alert("Error during the invitation process.");
    }
  };

  const handleSelfPreference = async () => {

    try {
        const selfResponse = await api.get(`/scheduler/meetings/${meeting.id}/set_self_preference/`);
        if (selfResponse.status !== 200) {
          throw new Error("Failed to send invitation.");
        }
        
        // Log the response (you can handle the response data as needed)
        
        const url = selfResponse.data[0];
        window.open(url, '_blank').focus();
        console.log("Hello, world!");
        return selfResponse.data;
        

      await Promise.all(selfPromises);
      alert("Invitations sent successfully.");
    } catch (error) {
      console.error("Error during the invitation process:", error);
      alert("Error during the invitation process.");
    }
  };

  function openInNewTab(url) {
    window.open(url, '_blank').focus();
  }
  



  return (
    <div className="meeting-card">
      <div className="meeting-details">
        <h4>{meeting.name}</h4>
        <p>Date: {meeting.date}</p>
        <p>Duration: {meeting.duration}</p>
        <div className="action-buttons">
          <button onClick={() => onEdit(meeting)}>Edit</button>
          <button onClick={() => onDelete(meeting.id)}>Delete</button>
          <button onClick={handleInviteContact}>Invite</button>
          <button onClick={handleSelfPreference}>Set Self Preference</button>
        </div>
      </div>

      <div className='contact-container'>
        <p className="invite-header">Select contacts to invite</p>

        {/* Display contact list on the right side */}
        <div className="contact-list">

          {contacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => toggleSelectContact(contact.id)}
              className={selectedContactIds.includes(contact.id) ? "selected-contact" : "contact"}
            >
              {contact.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Meeting;
