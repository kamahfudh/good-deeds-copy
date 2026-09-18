import { Route, Routes } from "react-router-dom"
import { AppShell } from "./components/AppShell"
import { DeedsCatalog } from "./pages/DeedsCatalog"
import { DeedDetail } from "./pages/DeedDetail"
import { DeedSection } from "./pages/DeedSection"
import { MyDeeds } from "./pages/MyDeeds"
import { CompletionDetail } from "./pages/CompletionDetail"
import { Assessment } from "./pages/Assessment"
import { Social } from "./pages/Social"
import { SocialCompose } from "./pages/SocialCompose"
import { TadabburCompose } from "./pages/TadabburCompose"
import { SocialThread } from "./pages/SocialThread"
import { SocialProfile } from "./pages/SocialProfile"
import { ProfileSettings } from "./pages/ProfileSettings"
import { ChangePassword } from "./pages/ChangePassword"
import { PersonalInfo } from "./pages/PersonalInfo"
import { PrivacySettings } from "./pages/PrivacySettings"
import { GeneralSettings } from "./pages/GeneralSettings"
import { HijriDateSettings } from "./pages/HijriDateSettings"
import { PrayerTimeSettings } from "./pages/PrayerTimeSettings"
import { About } from "./pages/About"
import { Points } from "./pages/Points"
import { PointsRewards } from "./pages/PointsRewards"
import { PointsSocialEarning } from "./pages/PointsSocialEarning"
import { PointsDeedsEarning } from "./pages/PointsDeedsEarning"
import { MosqueCheckIn } from "./pages/MosqueCheckIn"
import { NotificationsSpotlight } from "./pages/NotificationsSpotlight"
import { NotificationsFollowRequests } from "./pages/NotificationsFollowRequests"

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DeedsCatalog />} />
        <Route path="/notifications" element={<NotificationsSpotlight />} />
        <Route path="/notifications/follow-requests" element={<NotificationsFollowRequests />} />
        <Route path="/deeds/:id" element={<DeedDetail />} />
        <Route path="/deeds/:id/check-in" element={<MosqueCheckIn />} />
        <Route path="/deeds/:id/:section" element={<DeedSection />} />
        <Route path="/my-deeds" element={<MyDeeds />} />
        <Route path="/my-deeds/history/:id" element={<CompletionDetail />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/social" element={<Social />} />
        <Route path="/social/new" element={<SocialCompose />} />
        <Route path="/social/tadabbur/new" element={<TadabburCompose />} />
        <Route path="/social/settings" element={<ProfileSettings />} />
        <Route path="/social/settings/password" element={<ChangePassword />} />
        <Route path="/social/settings/personal-info" element={<PersonalInfo />} />
        <Route path="/social/settings/privacy" element={<PrivacySettings />} />
        <Route path="/social/settings/general" element={<GeneralSettings />} />
        <Route path="/social/settings/general/hijri" element={<HijriDateSettings />} />
        <Route path="/social/settings/general/prayer-times" element={<PrayerTimeSettings />} />
        <Route path="/social/settings/general/about" element={<About />} />
        <Route path="/social/profile/:handle" element={<SocialProfile />} />
        <Route path="/social/:id" element={<SocialThread />} />
        <Route path="/points" element={<Points />} />
        <Route path="/points/rewards" element={<PointsRewards />} />
        <Route path="/points/social" element={<PointsSocialEarning />} />
        <Route path="/points/deeds" element={<PointsDeedsEarning />} />
      </Route>
    </Routes>
  )
}

export default App
