import express from "express";
import homeControllers from "../controllers/homeControllers";
import userController from "../controllers/userController";
import doctorControllers from "../controllers/doctorControllers";
import patientController from "../controllers/patientController";
import specialtyControllers from "../controllers/specialtyControllers";
import clinicControllers from "../controllers/clinicControllers";
let router = express.Router();

let initWebRoutes = (app) => {
  router.get("/", homeControllers.getHomePage);
  router.get("/crud", homeControllers.getCRUD);
  router.post("/post-crud", homeControllers.postCRUD);
  router.get("/get-crud", homeControllers.disPlayGetCRUD);
  router.get("/edit-crud", homeControllers.getEditCRUD);
  router.post("/put-crud", homeControllers.putCRUD);
  router.get("/delete-crud", homeControllers.deleteCRUD);

  router.post("/api/login", userController.handleLogin);
  router.get("/api/get-all-users", userController.handleGetAllUsers);
  router.post("/api/create-new-users", userController.handleCreateNewUser);
  router.put("/api/edit-users", userController.handleEditUsers);
  router.delete("/api/delete-users", userController.handleDeleteUser);

  router.get("/api/allcode", userController.getAllCode);
  router.get("/api/top-doctor-home", doctorControllers.getDoctorHome);
  router.get("/api/get-all-doctors", doctorControllers.getAllDoctors);
  router.post("/api/save-info-doctors", doctorControllers.postInfoDoctors);
  router.put("/api/save-info-patient", doctorControllers.postInfoPatient);
  router.get(
    "/api/get-detail-doctor-by-id",
    doctorControllers.getDetailDoctorById
  );
  router.post(
    "/api/bulk-create-schedule",
    doctorControllers.bulkCreateSchedule
  );

  router.get(
    "/api/get-schedule-doctor-by-date",
    doctorControllers.getScheduleByDate
  );
  router.get(
    "/api/get-extra-info-doctor-by-id",
    doctorControllers.getExtarInforDoctorById
  );
  router.get(
    "/api/get-profile-doctor-by-id",
    doctorControllers.getProfileDoctorById
  );

  router.get(
    "/api/get-list-patient-for-doctor",
    doctorControllers.getListPatientsForDoctor
  );

  // Booking
  router.post(
    "/api/patient-book-appointment",
    patientController.postBookAppointment
  );

  router.post(
    "/api/verify-book-appointment",
    patientController.postVerifyBookAppointment
  );

  //Specialty
  router.post(
    "/api/create-new-specialty",
    specialtyControllers.createSpecialty
  );
  router.get("/api/get-specialty", specialtyControllers.getAllSpecialty);
  router.get(
    "/api/get-detail-specialty-by-id",
    specialtyControllers.getDetailSpecialtyById
  );

  // Clinic

  router.post("/api/create-new-clinic", clinicControllers.createClinic);
  router.get("/api/get-clinic", clinicControllers.getAllClinic);
  router.get(
    "/api/get-detail-clinic-by-id",
    clinicControllers.getDetailClinicById
  );

  router.post("/api/send-remedy", doctorControllers.sendRemedy);

  router.get(
    "/api/get-list-patient-for-dt",
    doctorControllers.getListPatientsForDt
  );
  router.get("/api/get-all-list-patient", doctorControllers.getAllListPatient);

  router.get(
    "/api/get-all-patient-accept",
    doctorControllers.getaAllPatientAccept
  );

  router.post("/api/send-prescription", doctorControllers.sendPrescription);

  router.get("/api/get-all-patient", patientController.getAllPatient);
  router.get("/api/get-all-users-type-patient", userController.handleGetAllUsersPatient);
  router.get("/api/get-all-users-type", userController.handleGetAllUsersType);
  router.post("/create_payment_url", function (req, res, next) {
    // var ipAddr =
    //   req.headers["x-forwarded-for"] ||
    //   req.connection.remoteAddress ||
    //   req.socket.remoteAddress ||
    //   req.connection.socket.remoteAddress;
    var ipAddr = "127.0.0.1";
    var tmnCode = "U71WYR2Q";
    var secretKey = "YOSNOKWVMAAMZLBUGTFZRHTNPHLXCITB";
    var vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    var returnUrl = "http://localhost:3000/detail-doctor/161";

    var date = new Date();
    var createDate =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    var orderId = createDate.slice(-6);
    var amount = req.body.amount;
    var bankCode = "NCB";

    var orderInfo = req.body.orderInfo;
    var orderType = "other";
    var locale = "vn";
    var currCode = "VND";
    var vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = orderInfo;
    vnp_Params["vnp_OrderType"] = orderType;
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    vnp_Params = sortObject(vnp_Params);

    var querystring = require("qs");
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var crypto = require("crypto");
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    res.redirect(vnpUrl);
  });
  return app.use("/", router);
};

function sortObject(obj) {
  var sorted = {};
  var str = [];
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

module.exports = initWebRoutes;
