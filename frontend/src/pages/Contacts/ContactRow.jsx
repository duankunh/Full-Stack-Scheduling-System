import "./ContactRow.css";

const ContactRow = ({ contact }) => {
  return (
    <tr className="contacts-table__body__row">
      <td className="contacts-table__body__row__data-cell">{contact.name}</td>
      <td className="contacts-table__body__row__data-cell">{contact.email}</td>
      <td className="contacts-table__body__row__data-cell">{contact.phone}</td>
      <td className="contacts-table__body__row__data-cell">
        <button
          className="contacts-table__body__row__contact-edit-button">Edit
        </button>
        <button
          className="contacts-table__body__row__contact-delete-button">Delete
        </button>
      </td>
      {/*<td className="contacts-table__body__row__data-cell">Pending</td>*/}
    </tr>
  );
}


export default ContactRow;
