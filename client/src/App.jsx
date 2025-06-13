
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
import ProtectedRoutes from "../src/ProtectedRoutes/protected.routes";
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
            <ProtectedRoutes>
              <PageWithNavbar>
                <Customer />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/goldsmith"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Goldsmith />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/bill"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Billing />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Report />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />

        <Route
          path="/customerreport"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <CustomerReport />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/overallreport"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Overallreport />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/jobcardreport"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Jobcardreport />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/receiptreport"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <ReceiptReport />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/receiptvoucher"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Receipt />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/stock"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Stock />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/customertrans"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Customertrans />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/customerorders"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Customerorders/>
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/jobcard/:id/:name"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Jobcard />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />

        <Route
          path="/goldsmithdetails/:id/:name"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <GoldsmithDetails />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="jobcarddd"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Jobcarddd />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />

        <Route
          path="/jobcardddReport"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <JobcardddReport />
              </PageWithNavbar>
            </ProtectedRoutes>
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

  const hideNavbarPaths = ["/",];

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










