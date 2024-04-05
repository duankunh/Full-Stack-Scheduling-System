import './Meeting.css';
import {useState} from "react";
import api from "../../api.js";

function Meeting({ meeting, onEdit, onDelete, contacts }) {
  const [selectedContactId, setSelectedContactId] = useState(-1); // no contact selected

  const handleSelectContact = (e) => {
    setSelectedContactId(e.target.value);
  }

  // handleInviteContact
const handleInviteContact = async () => {
  if (!selectedContactId) {
    alert("Please select a contact first.");
    return;
  }

  try {
    const inviteResponse = await api.get(`/scheduler/meetings/${meeting.id}/invite/${selectedContactId}/`);
    if (inviteResponse.status === 200) {
      alert("Invitation sent successfully.");
    } else {
      console.error("Failed to send the invitation:", inviteResponse);
      alert("Failed to send the invitation.");
    }
  } catch (error) {
    console.error("Error during the invitation process:", error);
    alert("Error during the invitation process.");
  }
};


  return (
    <div className="meeting-card">
      <h4>{meeting.name}</h4>
      <p>Date: {meeting.date}</p>
      <p>Duration: {meeting.duration} minutes</p>
      <button onClick={() => onEdit(meeting)}>Edit</button>
      <button onClick={() => onDelete(meeting.id)}>Delete</button>
      <button onClick={handleInviteContact}>Invite</button>
      <select value={selectedContactId} onChange={handleSelectContact}>
        <option defaultValue="" disabled>Select Contact</option>
        {contacts.map(contact => (
          <option key={contact.id} value={contact.id}>{contact.name}</option>
        ))}
      </select>
    </div>
  );
}

export default Meeting;
