
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home/Home";
import Customer from "./components/Customer/Customer";
import Goldsmith from "./components/Goldsmith/Goldsmith";
import Billing from "./components/Billing/Billing";
import Report from "./components/Report/Report";
import Stock from "./components/Stock/Stock";
import Navbar from "./components/Navbar/Navbar";
import Master from "./components/Master/Master";
import MasterCustomer from "./components/Master/Mastercustomer";
import Customertrans from "./components/Customer/Customertrans";
import Jobcard from "./components/Goldsmith/Jobcard";
import AddCustomer from "./components/Billing/Addcustomer";
import CustomerReport from "./components/Report/customer.report";
import Overallreport from "./components/Report/overallreport";
import Jobcardreport from "./components/Report/jobcardreport";
import GoldsmithDetails from "./components/Goldsmith/GoldsmithDetails";
import Jobcarddd from "./components/Goldsmith/Jobcarddd";
import JobcardddReport from "./components/Report/jobcardddReport";
import ReceiptReport from "./components/Report/receiptreport";
import Receipt from "./components/ReceiptVoucher/receiptvoucher";
import Customerorders from "./components/Customer/Customerorders";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/customer"
          element={
            <PageWithNavbar>
              <Customer />
            </PageWithNavbar>
          }
        />
        <Route
          path="/goldsmith"
          element={
            <PageWithNavbar>
              <Goldsmith />
            </PageWithNavbar>
          }
        />
        <Route
          path="/bill"
          element={
            <PageWithNavbar>
              <Billing />
            </PageWithNavbar>
          }
        />
        <Route
          path="/report"
          element={
            <PageWithNavbar>
              <Report />
            </PageWithNavbar>
          }
        />
        <Route
          path="/customerreport"
          element={
            <PageWithNavbar>
              <CustomerReport />
            </PageWithNavbar>
          }
        />
        <Route
          path="/overallreport"
          element={
            <PageWithNavbar>
              <Overallreport />
            </PageWithNavbar>
          }
        />
        <Route
          path="/jobcardreport"
          element={
            <PageWithNavbar>
              <Jobcardreport />
            </PageWithNavbar>
          }
        />
        <Route
          path="/receiptreport"
          element={
            <PageWithNavbar>
              <ReceiptReport />
            </PageWithNavbar>
          }
        />
        <Route
          path="/receiptvoucher"
          element={
            <PageWithNavbar>
              <Receipt />
            </PageWithNavbar>
          }
        />
        <Route
          path="/stock"
          element={
            <PageWithNavbar>
              <Stock />
            </PageWithNavbar>
          }
        />
        <Route
          path="/customertrans"
          element={
            <PageWithNavbar>
              <Customertrans />
            </PageWithNavbar>
          }
        />
        <Route
          path="/customerorders"
          element={
            <PageWithNavbar>
              <Customerorders />
            </PageWithNavbar>
          }
        />
        <Route
          path="/jobcard/:id/:name"
          element={
            <PageWithNavbar>
              <Jobcard />
            </PageWithNavbar>
          }
        />
        <Route
          path="/goldsmithdetails/:id/:name"
          element={
            <PageWithNavbar>
              <GoldsmithDetails />
            </PageWithNavbar>
          }
        />
        <Route
          path="/jobcarddd"
          element={
            <PageWithNavbar>
              <Jobcarddd />
            </PageWithNavbar>
          }
        />
        <Route
          path="/jobcardddReport"
          element={
            <PageWithNavbar>
              <JobcardddReport />
            </PageWithNavbar>
          }
        />

        <Route path="/master" element={<Master />} />
        <Route path="/mastercustomer" element={<MasterCustomer />} />
        <Route path="/addcustomer" element={<AddCustomer />} />
      </Routes>
    </BrowserRouter>
  );
}

function PageWithNavbar({ children }) {
  const location = useLocation();
  const hideNavbarPaths = ["/"];
  if (hideNavbarPaths.includes(location.pathname)) {
    return children;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default App;


