# MediQueue – Hospital OPD Waiting Time Predictor

MediQueue is a clean, responsive frontend web application built to eliminate long, congested hospital waiting lines. It provides digital token booking, live queue updates, and predictable consultation wait times across hospital Outpatient Departments (OPD).

---

## 📌 Problem Statement
In most civil and district hospitals, patients arrive early and wait 1–3 hours in crowded waiting halls without knowing when their consultation will occur. This causes corridor congestion, increased cross-infection risk, and patient frustration.

## 💡 Solution
MediQueue introduces a transparent, digital-first queue management workflow:
- Patients register and book OPD tokens in seconds.
- The platform dynamically predicts wait times based on live doctor pacing and queue length.
- Doctors manage consultations through a dedicated staff portal, updating waiting times across the hospital in real time.
- Critical and trauma cases are directed away from standard OPD queues to the 24/7 Emergency Ward.

---

## ⚙️ How the Prediction Works
The waiting time estimation uses a simple, deterministic calculation:

$$\text{Estimated Wait Time} = \text{Patients Ahead} \times \text{Doctor's Average Consultation Time}$$

- **Patients Ahead** = $(\text{Patient's Token Number} - \text{Currently Serving Token} - 1)$
- **Example:** If 4 patients are ahead and the doctor averages 10 minutes per patient, the estimated wait time is **40 minutes**.

---

## ✨ Key Features

### 1. Patient Portal
- **Account Registration & Login:** Create personal accounts storing contact details and patient profiles.
- **Instant Token Booking:** Select department, physician, date, and time slot.
- **Live Token Dashboard:** View current token number, room number, doctor name, and real-time wait estimation.
- **Token Cancellation:** Free up queue spots if the patient cannot attend.

### 2. Live Queue Board
- Real-time overview of active tokens across all OPD departments (General Medicine, Pediatrics, Orthopedics, Cardiology, ENT, Dermatology).

### 3. Doctor Consultation Desk (Protected)
- Separate staff login portal for consulting physicians.
- Real-time queue counters showing total waiting patients and average consultation pace.
- **"Complete & Call Next Token"** action button that automatically advances the queue and recalculates waiting times for all patients.

### 4. Emergency & Casualty Triage Alert
- High-visibility emergency protocols ensuring acute, high-risk cases proceed directly to 24/7 trauma care rather than waiting in OPD queues.

---

## 🛠️ Tech Stack
- **HTML5:** Semantic markup and accessible form architecture.
- **CSS3:** Custom responsive styling with clean medical aesthetics (Navy `#1e3a8a`, clean slate borders, zero bloated animation).
- **Vanilla JavaScript (ES6+):** Dynamic DOM updates, navigation routing, and live queue mathematics.
- **Web Storage API (`localStorage`):** Client-side persistence for patient accounts, doctor sessions, active tokens, and queue states.

---

## 🚀 How to Run the Project

No Node.js, npm, or backend server installation is required.

1. **Clone or Download the Repository:**
   ```bash
   git clone [https://github.com/your-username/mediqueue.git](https://github.com/your-username/mediqueue.git)
   cd mediqueue
