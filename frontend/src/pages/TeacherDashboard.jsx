import { useState } from "react";
import {
    LayoutDashboard,
    FileText,
    Users,
    Award,
    Calendar,
    Bell,
    User,
    LogOut,
    Menu
} from "lucide-react";

import "../styles/Teacher.css";

function TeacherDashboard() {

    const [active, setActive] = useState("dashboard")

    const nav = [
        { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
        { id: "grading", name: "Grading", icon: FileText },
        { id: "students", name: "My Students", icon: Users },
        { id: "certifications", name: "Certifications", icon: Award },
        { id: "schedule", name: "Schedule", icon: Calendar }
    ]

    return (

        <>
        </>

    )
}

export default TeacherDashboard