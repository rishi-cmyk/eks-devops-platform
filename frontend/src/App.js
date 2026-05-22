import React, { useEffect, useState } from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress
} from "@mui/material";

import API from "./services/api";

function App() {

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: ""
  });

  const fetchEmployees = async () => {
    try {
      const response = await API.get("/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Employee Management Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Container style={{ marginTop: "30px" }}>

        <Button
          variant="contained"
          onClick={handleOpen}
          style={{ marginBottom: "20px" }}
        >
          Add Employee
        </Button>

        {loading ? (
          <CircularProgress />
        ) : (

          <TableContainer component={Paper}>
            <Table>

              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {employees.map((emp, index) => (
                  <TableRow key={index}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </TableContainer>
        )}

      </Container>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Employee</DialogTitle>

        <DialogContent>

          <TextField
            margin="dense"
            label="Name"
            name="name"
            fullWidth
            variant="outlined"
            onChange={handleChange}
          />

          <TextField
            margin="dense"
            label="Email"
            name="email"
            fullWidth
            variant="outlined"
            onChange={handleChange}
          />

          <TextField
            margin="dense"
            label="Department"
            name="department"
            fullWidth
            variant="outlined"
            onChange={handleChange}
          />

        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>

          <Button variant="contained">
            Save
          </Button>
        </DialogActions>

      </Dialog>

    </div>
  );
}

export default App;
