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
  setShowAddContactModal(true);
  setCurrentContactId(null); // Clear the current contact ID
 // Show the modal with the form populated for editing
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

  // Constants
  const CONTACTS_PER_PAGE = 5;

  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages
  const totalPages = Math.ceil(contacts.length / CONTACTS_PER_PAGE);

  // Calculate the index of the first and last contact on the current page
  const firstContactIndex = (currentPage - 1) * CONTACTS_PER_PAGE;
  const lastContactIndex = firstContactIndex + CONTACTS_PER_PAGE;
  
  // Slice the contacts array to only include the contacts for the current page
  const currentContacts = contacts.slice(firstContactIndex, lastContactIndex);

  // Navigate to the previous page
  const goToPreviousPage = () => {
    setCurrentPage(currentPage => Math.max(1, currentPage - 1));
  };

  // Navigate to the next page
  const goToNextPage = () => {
    setCurrentPage(currentPage => Math.min(totalPages, currentPage + 1));
  };
  
  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  

  return (
    <div className="table-wrapper">
      <button onClick={() => {setNewContact({ name: '', email: '', phone: '' });
                              setShowAddContactModal(true);}} className="contacts-table__add_button">
        Add Contact
      </button>

      <table className="contacts-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentContacts.map(contact => (
            <tr key={contact.id}>
              <td>{contact.name}</td>
              <td>{contact.email}</td>
              <td className="actions">
                <button onClick={() => startEditContact(contact)}>Edit</button>
                <button onClick={() => deleteContact(contact.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddContactModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowAddContactModal(false)}>&times;</span>
            <form onSubmit={handleContactSubmit}>
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" name="name" value={newContact.name} onChange={handleChange} required />

              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" value={newContact.email} onChange={handleChange} required />

              <button type="submit">Add Contact</button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
          </div>
        </div>
      )}
      <div className="pagination-controls">
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button key={index + 1} onClick={() => paginate(index + 1)
          } className={currentPage === index + 1 ? 'active' : ''}>
            {index + 1}
          </button>
        ))}
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Contacts;
