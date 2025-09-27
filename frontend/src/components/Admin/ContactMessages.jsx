import React, { useState, useEffect, useRef } from "react";
import {
  FaSpinner,
  FaCheckCircle,
  FaHourglassHalf,
  FaInfoCircle,
  FaEllipsisV,
  FaTimes,
  FaSearch,
  FaDownload,
  FaSort,
} from "react-icons/fa";
import axios from "axios";

const ContactMessages = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [selectedContact, setSelectedContact] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchContacts();
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setActionMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "http://localhost:9000/api/contact/admin/contacts"
      );
      setContacts(response.data.data.contacts);
    } catch (err) {
      setError("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:9000/api/contact/admin/contacts/${contactId}/status`,
        { status: newStatus }
      );

      setContacts((prev) =>
        prev.map((c) =>
          c._id === contactId ? { ...c, status: newStatus } : c
        )
      );

      setToastMessage(`Message status updated to "${newStatus}".`);
      setToastType("success");
    } catch {
      setToastMessage("Failed to update status.");
      setToastType("error");
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await axios.delete(
        `http://localhost:9000/api/contact/admin/contacts/${contactId}`
      );
      setContacts((prev) => prev.filter((c) => c._id !== contactId));
      setToastMessage("Message deleted successfully.");
      setToastType("success");
    } catch {
      setToastMessage("Failed to delete message.");
      setToastType("error");
    }
  };

  const handleExportCSV = () => {
    const header = ["Name", "Email", "Subject", "Message", "Status", "Created At"];
    const rows = contacts.map((c) => [
      c.name,
      c.email,
      c.subject,
      c.message.replace(/\n/g, " "),
      c.status,
      new Date(c.createdAt).toLocaleString(),
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contact_messages.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaHourglassHalf className="text-yellow-500" />;
      case "in-progress":
        return <FaInfoCircle className="text-blue-500" />;
      case "resolved":
        return <FaCheckCircle className="text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) =>
    status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ");

  const handleActionMenu = (contactId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setActionMenuOpen(actionMenuOpen === contactId ? null : contactId);
  };

  // Filter + search
  let filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.message.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Sorting
  filteredContacts.sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "status") return a.status.localeCompare(b.status);
    return 0;
  });

  // Stats
  const stats = {
    total: contacts.length,
    pending: contacts.filter((c) => c.status === "pending").length,
    inProgress: contacts.filter((c) => c.status === "in-progress").length,
    resolved: contacts.filter((c) => c.status === "resolved").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <FaSpinner className="text-4xl animate-spin text-gray-500" />
        <p className="ml-4 text-gray-600">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-medium ${
            toastType === "success" ? "bg-green-500" : "bg-red-500"
          } transition-all`}
        >
          {toastMessage}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow text-center">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow text-center">
          <p className="text-gray-500 text-sm">In Progress</p>
          <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow text-center">
          <p className="text-gray-500 text-sm">Resolved</p>
          <p className="text-xl font-bold text-green-600">{stats.resolved}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Filter + Sort */}
        <div className="flex gap-3 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">By Name</option>
            <option value="status">By Status</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Subject</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Message</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <tr key={contact._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{contact.name}</td>
                <td className="px-6 py-4">{contact.subject}</td>
                <td className="px-6 py-4">{contact.email}</td>
                <td className="px-6 py-4 max-w-xs truncate">
                  {contact.message}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      contact.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : contact.status === "in-progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {getStatusIcon(contact.status)}
                    {getStatusText(contact.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={(e) => handleActionMenu(contact._id, e)}
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    <FaEllipsisV />
                  </button>
                  {/* Dropdown */}
                  {actionMenuOpen === contact._id && (
                    <div
                      ref={dropdownRef}
                      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-48"
                      style={{
                        top: menuPosition.top,
                        left: menuPosition.left,
                      }}
                    >
                      <button
                        onClick={() => {
                          handleUpdateStatus(contact._id, "in-progress");
                          setActionMenuOpen(null);
                        }}
                        disabled={contact.status !== "pending"}
                        className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 disabled:opacity-50"
                      >
                        Mark In Progress
                      </button>
                      <button
                        onClick={() => {
                          handleUpdateStatus(contact._id, "resolved");
                          setActionMenuOpen(null);
                        }}
                        disabled={contact.status === "resolved"}
                        className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100 disabled:opacity-50"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => {
                          setSelectedContact(contact);
                          setActionMenuOpen(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(contact._id);
                          setActionMenuOpen(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Full Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setSelectedContact(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <FaTimes />
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Message Details
            </h2>
            <p>
              <strong>Name:</strong> {selectedContact.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedContact.email}
            </p>
            <p>
              <strong>Subject:</strong> {selectedContact.subject}
            </p>
            <p className="whitespace-pre-line">
              <strong>Message:</strong> {selectedContact.message}
            </p>
            <p>
              <strong>Status:</strong> {getStatusText(selectedContact.status)}
            </p>
            <p>
              <strong>Received At:</strong>{" "}
              {new Date(selectedContact.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
