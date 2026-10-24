
const express = require("express");
const cors = require("cors");
const RequestLogger = require("./middlewares/logger")
const errorHandler = require("./middlewares/errorHandler")
const authRoutes = require("./routes/auth.routes")
const patientRoutes = require("./routes/patient.routes")
const validateEnv = require("./config/validateEnv")
const facilityRoutes = require("./routes/facility.routes")


validateEnv();

const app = express();


app.use(express.json());
app.use(cors('*'));

app.use(RequestLogger);

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/facilities', facilityRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'careGrid API is running'
    });
});



app.use(errorHandler);

module.exports = app;