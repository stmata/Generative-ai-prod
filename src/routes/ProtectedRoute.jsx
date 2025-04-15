import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import PageNotFound from '../components/PageNotFound/PageNotFound';
import Chatboot from "../components/Chatboot/Chatboot";
import ThankYou from "../components/ThankYou/ThankYou";

const LayoutWithNavbar = () => (
  <>
    <Outlet />
  </>
);

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Chatboot />} />
      <Route path="/ThankYou" element={<ThankYou />} />

      {/* Catch-all for 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


export default ProtectedRoutes;
