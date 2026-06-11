import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, Plus, X, FileText, FileSignature, FileCheck } from "lucide-react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  useMediaQuery,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
} from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getTAndCAndDec,
  createTAndCAndDec,
  updateTAndCAndDec,
  deleteTAndCAndDec,
} from "../../redux/actions/tAndCAndDec";
import { clearSnackbar } from "../../redux/actions/commonActions";

const TAndCAndDec = () => {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    type: "quotation_description",
    title: "",
    content: "",
    is_default: false,
    status: "active",
  });
  const [editId, setEditId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [errors, setErrors] = useState({});
  const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
  const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const { entries, loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.tAndCAndDec);

  // Filter entries by type
  const filteredEntries = entries.filter((entry) => {
    if (activeTab === 0) return entry.type === "quotation_description";
    if (activeTab === 1) return entry.type === "quotation_terms";
    return entry.type === "invoice_terms";
  });

  useEffect(() => {
    dispatch(clearSnackbar());
    dispatch(getTAndCAndDec());
  }, [dispatch]);

  useEffect(() => {
    if (snackbarMessage) {
      setSnackbarOpen(true);
    }
  }, [snackbarMessage]);

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
    setTimeout(() => {
      setLocalSnackbarMessage("");
      dispatch(clearSnackbar());
    }, 100);
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? 350 : 700,
    maxHeight: "90vh",
    overflowY: "auto",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "12px",
    p: 3,
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "quotation_description":
        return "Quotation Description";
      case "quotation_terms":
        return "Quotation Terms & Conditions";
      case "invoice_terms":
        return "Invoice Terms & Conditions";
      default:
        return type;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "quotation_description":
        return <FileText size={20} />;
      case "quotation_terms":
        return <FileSignature size={20} />;
      case "invoice_terms":
        return <FileCheck size={20} />;
      default:
        return <FileText size={20} />;
    }
  };

  const handleOpen = (type = "quotation_description") => {
    setFormData({
      type,
      title: "",
      content: "",
      is_default: false,
      status: "active",
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      type: "quotation_description",
      title: "",
      content: "",
      is_default: false,
      status: "active",
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  const handleEdit = (entry) => {
    setFormData({
      type: entry.type,
      title: entry.title,
      content: entry.content,
      is_default: entry.is_default,
      status: entry.status,
    });
    setEditId(entry.id);
    setIsEditMode(true);
    setOpen(true);
    setErrors({});
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.title.trim()) tempErrors.title = "Title is required";
    if (!formData.content.trim()) tempErrors.content = "Content is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (isEditMode) {
      dispatch(updateTAndCAndDec(editId, formData));
    } else {
      dispatch(createTAndCAndDec(formData));
    }
    handleClose();
  };

  const handleDeleteClick = (id) => {
    setSelectedDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    dispatch(deleteTAndCAndDec(selectedDeleteId));
    setDeleteConfirmOpen(false);
    setSelectedDeleteId(null);
  };

  return (
    <>
      {loading && entries.length === 0 ? (
        <div className="flex h-screen w-full items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">
              Terms & Conditions / Descriptions :
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="gradient"
                className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base"
                onClick={() => handleOpen("quotation_description")}
              >
                <FileText size={18} />
                Add Quotation Description
              </Button>
              <Button
                variant="gradient"
                className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base"
                onClick={() => handleOpen("quotation_terms")}
              >
                <FileSignature size={18} />
                Add Quotation T&C
              </Button>
              <Button
                variant="gradient"
                className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base"
                onClick={() => handleOpen("invoice_terms")}
              >
                <FileCheck size={18} />
                Add Invoice T&C
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Quotation Description" />
              <Tab label="Quotation Terms & Conditions" />
              <Tab label="Invoice Terms & Conditions" />
            </Tabs>
          </div>

          <div className="card-body p-0 mt-4">
            <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
              <table className="table">
                <thead className="table-header text-nowrap bg-[#053054] text-white">
                  <tr className="table-row">
                    <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                    <th className="table-head border border-gray-300 capitalize">Title</th>
                    <th className="table-head border border-gray-300 capitalize">Content</th>
                    <th className="table-head border border-gray-300 capitalize">Default</th>
                    <th className="table-head border border-gray-300 capitalize">Status</th>
                    <th className="table-head border border-gray-300 capitalize">Action</th>
                  </tr>
                </thead>
                <tbody className="table-body text-[#433C50]">
                  {filteredEntries.map((entry, index) => (
                    <tr className="table-row" key={entry.id}>
                      <td className="table-cell border border-gray-300">{index + 1}</td>
                      <td className="table-cell border border-gray-300">{entry.title}</td>
                      <td
                        className="table-cell border border-gray-300 max-w-md truncate"
                        dangerouslySetInnerHTML={{ __html: entry.content.substring(0, 100) + (entry.content.length > 100 ? "..." : "") }}
                      />
                      <td className="table-cell border border-gray-300 text-center">
                        {entry.is_default ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                            Default
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="table-cell border border-gray-300">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            entry.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="table-cell border border-gray-300">
                        <div className="flex items-center gap-x-4">
                          <button
                            className="text-blue-500"
                            onClick={() => handleEdit(entry)}
                          >
                            <PencilLine size={20} />
                          </button>
                          <button
                            className="text-red-500"
                            onClick={() => handleDeleteClick(entry.id)}
                          >
                            <Trash size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredEntries.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-gray-400">
                        No entries added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <div className="mb-4 flex items-center justify-between">
            <Typography variant="h6" className="font-semibold">
              {isEditMode ? "Update" : "Add"} {getTypeLabel(formData.type)}
            </Typography>
            <IconButton onClick={handleClose}>
              <X size={20} />
            </IconButton>
          </div>

          <div className="space-y-4">
            <TextField
              fullWidth
              label="Title"
              placeholder="Enter title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                setErrors({ ...errors, title: false });
              }}
              error={!!errors.title}
              helperText={errors.title}
            />

            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Content *</div>
              <ReactQuill
                value={formData.content}
                onChange={(value) => {
                  setFormData({ ...formData, content: value });
                  setErrors({ ...errors, content: false });
                }}
                theme="snow"
                placeholder={`Enter ${getTypeLabel(formData.type)} content...`}
                className="bg-white"
                style={{ height: "200px", marginBottom: "50px" }}
              />
              {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
            </div>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                />
              }
              label="Set as Default"
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outlined"
              className="rounded border border-[#433C50] px-4 py-2 capitalize text-[#433C50]"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              className={`rounded px-4 py-2 capitalize text-white ${isEditMode ? "bg-green-600" : "bg-[#053054]"}`}
              onClick={handleSubmit}
            >
              {isEditMode ? "Update" : "Add"}
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <Box sx={modalStyle}>
          <div className="mb-4 flex items-center justify-between">
            <Typography variant="h6" className="font-semibold">
              Confirm Delete
            </Typography>
            <IconButton onClick={() => setDeleteConfirmOpen(false)}>
              <X size={20} />
            </IconButton>
          </div>

          <Typography className="mb-6 justify-self-center text-[#433C50]">
            Are you sure you want to delete this entry?
          </Typography>

          <div className="mt-4 flex justify-center gap-4">
            <Button
              variant="gradient"
              className="rounded bg-red-700 px-4 py-2 capitalize text-white"
              onClick={confirmDelete}
            >
              Yes
            </Button>
            <Button
              variant="gradient"
              className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              No
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbarMessage ? snackbarSeverity : localSnackbarSeverity}
          variant="filled"
          onClose={handleSnackbarClose}
        >
          {snackbarMessage || localSnackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TAndCAndDec;