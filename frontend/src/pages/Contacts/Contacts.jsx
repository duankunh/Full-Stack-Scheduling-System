import { useState } from "react";
import "./Contacts.css";
import ContactRow from './ContactRow.jsx';

const Contacts = () => {
  // react component life cycle

  // state in react
  const [contacts, setContacts] = useState([
    {
      id: '1',
      name: 'Jack',
      email: 'jack@jack.ca',
      phone: '30910040'
    },
    {
      id: '2',
      name: 'Jackson',
      email: 'jackson@jackson.ca',
      phone: '12231242'
    },
    {
      id: '3',
      name: 'David',
      email: 'David@csc309.ca',
      phone: '2132313'
    }
  ]);

  // call api to get contacts data
  // const contacts = [
  //   {
  //     id: '1',
  //     name: 'Jack',
  //     email: 'jack@jack.ca',
  //     phone: '30910040'
  //   },
  //   {
  //     id: '2',
  //     name: 'Jackson',
  //     email: 'jackson@jackson.ca',
  //     phone: '12231242'
  //   },
  //   {
  //     id: '3',
  //     name: 'David',
  //     email: 'David@csc309.ca',
  //     phone: '2132313'
  //   }
  // ];

  const addContact = () => {
    setContacts([
        ...contacts, // spreading the previous contacts
        {
          id: 4,
          name: 'Kun',
          email: 'kun@gmail.com',
          phone: '1234567890',
        },
      ])
  };

  return (
    <div className="table-wrapper">
      <table className="contacts-table">
        <thead className="contacts-table__head">
        <tr>
          <th className="contacts-table__head__header">Name</th>
          <th className="contacts-table__head__header">Email</th>
          <th className="contacts-table__head__header">Phone</th>
          <th className="contacts-table__head__header">Actions</th>
          <th className="contacts-table__head__header">Status</th>
        </tr>
        </thead>
        <tbody>
        {contacts.map(c => (
          <ContactRow
            key={c.id}
            contact={c}
          />
        ))}
        </tbody>
        {/*<tfoot>*/}
        {/*</tfoot> */}
      </table>
      <div className="contacts-table__pagination">
        <button
          className="contacts-table__pagination__btn contacts-table__pagination__btn--left">
          {'<'}
        </button>
        <button
          className="contacts-table__pagination__btn contacts-table__pagination__btn--current">
          1
        </button>
        <button className="contacts-table__pagination__btn">
          2
        </button>
        <button className="contacts-table__pagination__btn">
          3
        </button>
        <button className="contacts-table__pagination__btn">
          4
        </button>
        <button className="contacts-table__pagination__btn">
          5
        </button>
        <button className="contacts-table__pagination__btn">
          6
        </button>
        <button
          className="contacts-table__pagination__btn contacts-table__pagination__btn--right">
          {'>'}
        </button>
      </div>
      <div className="contacts-table__add">
        <button onClick={addContact} className="contacts-table__add_button">
          Add Contact
        </button>
      </div>
    </div>
  );
}


export default Contacts;
