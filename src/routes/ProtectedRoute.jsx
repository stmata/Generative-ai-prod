import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import PageNotFound from "../components/PageNotFound/PageNotFound";
import UserInfos from "../components/UserInfos/UserInfos";
import Index from "../components/Index/Index";
import Tabs from "../components/Tabs/Tabs";

const LayoutWithNavbar = () => (
  <>
    <Outlet />
  </>
);

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route element={<LayoutWithNavbar />}>
        <Route path="/" element={<Index />} />
        <Route path="/127" element={<Tabs />} />
        <Route path="/userInfos/:sessionId" element={<UserInfos />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

export default ProtectedRoutes;
