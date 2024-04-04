import React, { useEffect, useState } from "react";
import api from "../../api.js"; // Adjust this path as necessary
import "./Contacts.css";
import ContactRow from './ContactRow';
import axios from "axios";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [currentContactId, setCurrentContactId] = useState(null);

  const startEditContact = (contact) => {
  setNewContact(contact); // Load the contact's current data into the form fields
  setCurrentContactId(contact.id); // Remember the ID of the contact being edited
  setShowAddContactModal(true); // Show the modal with the form populated for editing
};

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get('contacts/list/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        });
        setContacts(response.data);
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      }
    };
    fetchContacts();
  }, []);

  const handleContactSubmit = async (e) => {
  e.preventDefault(); // Prevent form submission from reloading the page

  try {
    let response;
    if (currentContactId) {
      response = await api.put(`contacts/${currentContactId}/`, newContact, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      setContacts(contacts.map(contact => contact.id === currentContactId ? response.data : contact));
    } else {
      response = await api.post('contacts/list/', newContact, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      setContacts([...contacts, response.data]);
    }
    setShowAddContactModal(false); // Close the modal
    setNewContact({ name: '', email: '', phone: '' }); // Reset form fields
    setCurrentContactId(null); // Clear the current contact ID
    setErrorMessage('');
  } catch (error) {
    if (error.response && error.response.data.error) {
      setErrorMessage(error.response.data.error);
    } else {
      console.error('Failed to submit contact:', error);
    }
  }
};

  const deleteContact = async (id) => {
  try {
    await api.delete(`contacts/${id}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      },
    });
    setContacts(contacts.filter(contact => contact.id !== id));
  } catch (error) {
    console.error('Failed to delete contact:', error);
    setErrorMessage('Failed to delete contact. Please try again.');
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewContact(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="table-wrapper">
      <button onClick={() => setShowAddContactModal(true)} className="contacts-table__add_button">
        Add Contact
      </button>

      {contacts.map(contact => (
        <div className="card" key={contact.id}>
          <h3>
            <div>name : {contact.name}</div>
            <div>email : {contact.email}</div>
          </h3>
          <button onClick={() => startEditContact(contact)}>Edit</button>
          <button onClick={() => deleteContact(contact.id)}>Delete</button>
        </div>
      ))}

      {showAddContactModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowAddContactModal(false)}>&times;</span>
            <form onSubmit={handleContactSubmit}>
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" name="name" value={newContact.name} onChange={handleChange} required />

              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" value={newContact.email} onChange={handleChange} required />

              <label htmlFor="phone">Phone:</label>
              <input type="text" id="phone" name="phone" value={newContact.phone} onChange={handleChange} required />

              <button type="submit">Add Contact</button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
          </div>
        </div>
      )}
      <div className="contacts-table__pagination">
      </div>
    </div>
  );
};

export default Contacts;
