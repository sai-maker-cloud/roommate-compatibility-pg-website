import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute.jsx";
import { OwnerRoute } from "./auth/OwnerRoute.jsx";
import { AppShell } from "./components/layout/AppShell.jsx";
import { OwnerLayout } from "./components/layout/OwnerLayout.jsx";
import { AuthForm } from "./features/auth/AuthForm.jsx";
import { BookingsPage } from "./features/bookings/BookingsPage.jsx";
import { ChatPage } from "./features/chat/ChatPage.jsx";
import { MatchesPage } from "./features/matches/MatchesPage.jsx";
import { PgListPage } from "./features/pg/PgListPage.jsx";
import { ProfilePage } from "./features/profile/ProfilePage.jsx";

// Owner Features
import { OwnerDashboard } from "./features/owner/OwnerDashboard.jsx";
import { OwnerPgList } from "./features/owner/OwnerPgList.jsx";
import { OwnerPgForm } from "./features/owner/OwnerPgForm.jsx";
import { OwnerBookings } from "./features/owner/OwnerBookings.jsx";

const App = () => (
  <Routes>
    <Route path="/login" element={<AuthForm mode="login" />} />
    <Route path="/register" element={<AuthForm mode="register" />} />

    {/* General Protected Routes */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
        <Route index element={<PgListPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Route>
    </Route>

    {/* Owner Protected Routes */}
    <Route element={<OwnerRoute />}>
      <Route element={<OwnerLayout />}>
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/pgs" element={<OwnerPgList />} />
        <Route path="/owner/pgs/new" element={<OwnerPgForm />} />
        <Route path="/owner/bookings" element={<OwnerBookings />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
