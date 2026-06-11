import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, X } from "lucide-react";
import { AiFillApi } from "react-icons/ai";
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
} from "@mui/material";
import {
  getAPIs,
  createAPI,
  updateAPI,
  deleteAPI,
} from "../../../redux/actions/apiMaster";
import { clearSnackbar } from "../../../redux/actions/commonActions";

const ApiData = () => {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width:600px)");

  const [open, setOpen] = useState(false);
  const [apiName, setApiName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState(false);

  const [editId, setEditId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const { apis, loading, snackbarMessage, snackbarSeverity } = useSelector(
    (state) => state.apiMaster
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Format yyyy-mm-dd for input
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format dd-mm-yyyy for backend
  const formatDateForBackend = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    dispatch(clearSnackbar());
    dispatch(getAPIs());

    const today = new Date();
    const todayStr = formatDateForInput(today);
    setStartDate(todayStr);
    setEndDate(todayStr);
  }, [dispatch]);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? 330 : 500,
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "12px",
    p: 3,
  };

  const handleOpen = () => {
    setOpen(true);
    setError(false);
  };

  const handleClose = () => {
    setOpen(false);
    setApiName("");
    setApiUrl("");
    setApiKey("");
    const today = formatDateForInput(new Date());
    setStartDate(today);
    setEndDate(today);
    setError(false);
    setIsEditMode(false);
    setEditId(null);
  };

  const handleEdit = (api) => {
    setApiName(api.api_name || "");
    setApiUrl(api.api_url || "");
    setApiKey(api.api_key || "");

    if (api.start_date) {
      const [d, m, y] = api.start_date.split("-");
      setStartDate(`${y}-${m}-${d}`);
    }
    if (api.end_date) {
      const [d, m, y] = api.end_date.split("-");
      setEndDate(`${y}-${m}-${d}`);
    }

    setEditId(api.id);
    setIsEditMode(true);
    setOpen(true);
    setError(false);
  };

  const handleAddOrUpdate = () => {
    if (!apiName.trim() || !apiUrl.trim() || !apiKey.trim()) {
      setError(true);
      setSnackbarOpen(true);
      return;
    }

    const payload = {
      api_name: apiName.trim(),
      api_url: apiUrl.trim(),
      api_key: apiKey.trim(),
      start_date: formatDateForBackend(startDate),
      end_date: formatDateForBackend(endDate),
    };

    if (isEditMode) {
      dispatch(updateAPI(editId, payload));
    } else {
      dispatch(createAPI(payload));
    }

    setSnackbarOpen(true);
    handleClose();
  };

  const handleDeleteClick = (id) => {
    setSelectedDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    dispatch(deleteAPI(selectedDeleteId));
    setSnackbarOpen(true);
    setDeleteConfirmOpen(false);
    setSelectedDeleteId(null);
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
    setTimeout(() => dispatch(clearSnackbar()), 100);
  };

  return (
    <>
      {loading ? (
        <div className="flex h-screen w-full items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-between text-nowrap">
            <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">
              API Data :
            </div>
            <Button
              variant="gradient"
              className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base lg:text-base"
              onClick={handleOpen}
            >
              <AiFillApi size={20} />
              Create API
            </Button>
          </div>

          <div className="card-body p-0">
            <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
              <table className="table">
                <thead className="table-header text-nowrap bg-[#053054] text-white">
                  <tr className="table-row">
                    <th className="table-head border border-gray-300 capitalize">
                      Sr. No.
                    </th>
                    <th className="table-head border border-gray-300 capitalize">
                      API Name
                    </th>
                    <th className="table-head border border-gray-300 capitalize">
                      API URL
                    </th>
                    <th className="table-head border border-gray-300 capitalize">
                      API Key
                    </th>
                    <th className="table-head border border-gray-300 capitalize">
                      Start Date
                    </th>
                    <th className="table-head border border-gray-300 capitalize">
                      End Date
                    </th>
                    <th className="table-head border border-gray-300 capitalize">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="table-body text-[#433C50]">
                  {apis.map((item, index) => (
                    <tr className="table-row" key={item.id}>
                      <td className="table-cell border border-gray-300">{index + 1}</td>
                      <td className="table-cell border border-gray-300">{item.api_name}</td>
                      <td className="table-cell border border-gray-300">{item.api_url}</td>
                      <td className="table-cell border border-gray-300">{item.api_key}</td>
                      <td className="table-cell border border-gray-300">{item.start_date}</td>
                      <td className="table-cell border border-gray-300">{item.end_date}</td>
                      <td className="table-cell border border-gray-300">
                        <div className="flex items-center gap-x-4">
                          <button className="text-blue-500" onClick={() => handleEdit(item)}>
                            <PencilLine size={20} />
                          </button>
                          <button className="text-red-500" onClick={() => handleDeleteClick(item.id)}>
                            <Trash size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {apis.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-4 text-center text-gray-400">
                        No API Data Added Yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <div className="mb-4 flex items-center justify-between">
            <Typography variant="h6" className="font-semibold">
              {isEditMode ? "Update API Data" : "Add API Data"}
            </Typography>
            <IconButton onClick={handleClose}>
              <X size={20} />
            </IconButton>
          </div>
          <div className="space-y-5">
            <TextField
              fullWidth
              label="API Name*"
              placeholder="Enter API Name"
              variant="outlined"
              error={error && !apiName}
              value={apiName}
              onChange={(e) => {
                setApiName(e.target.value);
                setError(false);
              }}
              size="small"
            />
            <TextField
              fullWidth
              label="API Url*"
              placeholder="Enter API Url"
              variant="outlined"
              error={error && !apiUrl}
              value={apiUrl}
              onChange={(e) => {
                setApiUrl(e.target.value);
                setError(false);
              }}
              size="small"
            />
            <TextField
              fullWidth
              label="API Key*"
              placeholder="Enter API Key"
              variant="outlined"
              error={error && !apiKey}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError(false);
              }}
              size="small"
            />
            <div className="flex gap-5">
              <TextField
                fullWidth
                type="date"
                label="Start Date*"
                variant="outlined"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="date"
                label="End Date*"
                variant="outlined"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outlined"
              className="rounded border border-[#433C50] px-4 py-2 capitalize text-[#433C50]"
              onClick={handleClose}
            >
              Close
            </Button>
            <Button
              className={`rounded px-4 py-2 capitalize text-white ${isEditMode ? "bg-green-900" : "bg-[#053054]"}`}
              onClick={handleAddOrUpdate}
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
            <Typography variant="h6" className="font-semibold">Confirm Delete</Typography>
            <IconButton onClick={() => setDeleteConfirmOpen(false)}>
              <X size={20} />
            </IconButton>
          </div>
          <Typography className="mb-6 justify-self-center text-[#433C50]">
            Are you sure you want to delete this API?
          </Typography>
          <div className="mt-4 flex justify-center gap-4">
            <Button variant="gradient" className="rounded bg-red-700 px-4 py-2 capitalize text-white" onClick={confirmDelete}>Yes</Button>
            <Button variant="gradient" className="rounded bg-gray-500 px-4 py-2 capitalize text-white" onClick={() => setDeleteConfirmOpen(false)}>No</Button>
          </div>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbarSeverity} variant="filled" onClose={handleSnackbarClose}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ApiData;
