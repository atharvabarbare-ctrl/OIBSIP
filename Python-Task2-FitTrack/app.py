import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import sqlite3
import csv
from datetime import datetime

import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg


DB_NAME = "fittrack.db"


# =========================================================
# DATABASE
# =========================================================

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bmi_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            weight REAL NOT NULL,
            height REAL NOT NULL,
            bmi REAL NOT NULL,
            category TEXT NOT NULL,
            recorded_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()


# =========================================================
# BMI LOGIC
# =========================================================

def calculate_bmi(weight, height):
    if weight <= 0 or height <= 0:
        raise ValueError("Values must be greater than zero.")

    return round(weight / (height * height), 2)


def get_category(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal"
    elif bmi < 30:
        return "Overweight"
    return "Obese"


def get_category_color(category):
    colors = {
        "Underweight": "#38bdf8",
        "Normal": "#22c55e",
        "Overweight": "#f59e0b",
        "Obese": "#ef4444"
    }

    return colors.get(category, "#94a3b8")


def get_category_description(category):
    descriptions = {
        "Underweight":
            "Your BMI is below the normal range.",
        "Normal":
            "Your BMI is within the normal range.",
        "Overweight":
            "Your BMI is above the normal range.",
        "Obese":
            "Your BMI is in the obese range."
    }

    return descriptions.get(category, "")


# =========================================================
# MAIN APPLICATION
# =========================================================

class FitTrackPro:

    def __init__(self, root):

        self.root = root

        self.root.title(
            "FitTrack Pro | BMI Health Dashboard"
        )

        self.root.geometry("1200x760")
        self.root.minsize(1050, 680)

        self.user_id = None
        self.user_name = None

        self.setup_colors()
        self.setup_styles()

        init_db()

        self.build_interface()
        self.load_users()

    # =====================================================
    # COLORS
    # =====================================================

    def setup_colors(self):

        self.bg = "#0f172a"
        self.card = "#1e293b"
        self.card2 = "#243247"
        self.border = "#334155"

        self.text = "#f8fafc"
        self.muted = "#94a3b8"

        self.accent = "#38bdf8"
        self.success = "#22c55e"
        self.warning = "#f59e0b"
        self.danger = "#ef4444"

    # =====================================================
    # STYLES
    # =====================================================

    def setup_styles(self):

        style = ttk.Style()

        try:
            style.theme_use("clam")
        except tk.TclError:
            pass

        self.root.configure(
            bg=self.bg
        )

        style.configure(
            "TFrame",
            background=self.bg
        )

        style.configure(
            "Card.TFrame",
            background=self.card
        )

        style.configure(
            "TLabel",
            background=self.bg,
            foreground=self.text,
            font=("Segoe UI", 10)
        )

        style.configure(
            "Card.TLabel",
            background=self.card,
            foreground=self.text
        )

        style.configure(
            "Title.TLabel",
            background=self.bg,
            foreground=self.text,
            font=("Segoe UI", 28, "bold")
        )

        style.configure(
            "Subtitle.TLabel",
            background=self.bg,
            foreground=self.muted,
            font=("Segoe UI", 11)
        )

        style.configure(
            "CardTitle.TLabel",
            background=self.card,
            foreground=self.text,
            font=("Segoe UI", 12, "bold")
        )

        style.configure(
            "Result.TLabel",
            background=self.card,
            foreground=self.text,
            font=("Segoe UI", 42, "bold")
        )

        style.configure(
            "Status.TLabel",
            background=self.card,
            font=("Segoe UI", 16, "bold")
        )

        style.configure(
            "TEntry",
            fieldbackground="#0f172a",
            foreground=self.text,
            insertcolor=self.text,
            bordercolor=self.border,
            padding=8
        )

        style.configure(
            "TCombobox",
            fieldbackground="#0f172a",
            background="#0f172a",
            foreground=self.text,
            padding=7
        )

        style.configure(
            "TButton",
            background=self.card2,
            foreground=self.text,
            font=("Segoe UI", 10, "bold"),
            padding=(12, 8),
            borderwidth=0
        )

        style.map(
            "TButton",
            background=[
                ("active", "#334155")
            ]
        )

        style.configure(
            "Accent.TButton",
            background=self.accent,
            foreground="#0f172a",
            font=("Segoe UI", 10, "bold"),
            padding=(16, 10)
        )

        style.map(
            "Accent.TButton",
            background=[
                ("active", "#7dd3fc")
            ]
        )

        style.configure(
            "Treeview",
            background="#111827",
            foreground=self.text,
            fieldbackground="#111827",
            rowheight=32,
            borderwidth=0,
            font=("Segoe UI", 9)
        )

        style.configure(
            "Treeview.Heading",
            background=self.card2,
            foreground=self.text,
            font=("Segoe UI", 9, "bold"),
            padding=8
        )

        style.map(
            "Treeview",
            background=[
                ("selected", "#0369a1")
            ]
        )

    # =====================================================
    # INTERFACE
    # =====================================================

    def build_interface(self):

        outer = tk.Frame(
            self.root,
            bg=self.bg
        )

        outer.pack(
            fill="both",
            expand=True,
            padx=25,
            pady=22
        )

        # ---------------- HEADER ----------------

        header = tk.Frame(
            outer,
            bg=self.bg
        )

        header.pack(
            fill="x",
            pady=(0, 20)
        )

        title_area = tk.Frame(
            header,
            bg=self.bg
        )

        title_area.pack(side="left")

        tk.Label(
            title_area,
            text="FitTrack",
            bg=self.bg,
            fg=self.text,
            font=("Segoe UI", 29, "bold")
        ).pack(anchor="w")

        tk.Label(
            title_area,
            text="Personal BMI & Health Progress Dashboard",
            bg=self.bg,
            fg=self.muted,
            font=("Segoe UI", 11)
        ).pack(anchor="w")

        self.user_badge = tk.Label(
            header,
            text="●  No user selected",
            bg=self.bg,
            fg=self.muted,
            font=("Segoe UI", 11, "bold")
        )

        self.user_badge.pack(
            side="right",
            pady=10
        )

        # ---------------- NAVIGATION ----------------

        nav = tk.Frame(
            outer,
            bg=self.card
        )

        nav.pack(
            fill="x",
            pady=(0, 15)
        )

        self.dashboard_btn = tk.Button(
            nav,
            text="  Dashboard  ",
            command=lambda: self.show_page("dashboard"),
            bg=self.accent,
            fg="#0f172a",
            activebackground="#7dd3fc",
            activeforeground="#0f172a",
            bd=0,
            font=("Segoe UI", 10, "bold"),
            padx=15,
            pady=8
        )

        self.dashboard_btn.pack(
            side="left",
            padx=5,
            pady=5
        )

        self.history_btn = tk.Button(
            nav,
            text="  History & Analytics  ",
            command=lambda: self.show_page("history"),
            bg=self.card,
            fg=self.muted,
            activebackground=self.card2,
            activeforeground=self.text,
            bd=0,
            font=("Segoe UI", 10, "bold"),
            padx=15,
            pady=8
        )

        self.history_btn.pack(
            side="left",
            padx=5,
            pady=5
        )

        # ---------------- CONTENT ----------------

        self.content = tk.Frame(
            outer,
            bg=self.bg
        )

        self.content.pack(
            fill="both",
            expand=True
        )

        self.dashboard_page = tk.Frame(
            self.content,
            bg=self.bg
        )

        self.history_page = tk.Frame(
            self.content,
            bg=self.bg
        )

        self.build_dashboard()
        self.build_history()

        self.show_page("dashboard")

    # =====================================================
    # PAGE SWITCH
    # =====================================================

    def show_page(self, page):

        self.dashboard_page.pack_forget()
        self.history_page.pack_forget()

        if page == "dashboard":

            self.dashboard_page.pack(
                fill="both",
                expand=True
            )

            self.dashboard_btn.configure(
                bg=self.accent,
                fg="#0f172a"
            )

            self.history_btn.configure(
                bg=self.card,
                fg=self.muted
            )

        else:

            self.history_page.pack(
                fill="both",
                expand=True
            )

            self.history_btn.configure(
                bg=self.accent,
                fg="#0f172a"
            )

            self.dashboard_btn.configure(
                bg=self.card,
                fg=self.muted
            )

            self.refresh_history()

    # =====================================================
    # DASHBOARD
    # =====================================================

    def build_dashboard(self):

        page = self.dashboard_page

        # ---------- TOP CARDS ----------

        stats = tk.Frame(
            page,
            bg=self.bg
        )

        stats.pack(
            fill="x",
            pady=(0, 15)
        )

        self.create_stat_card(
            stats,
            "CURRENT BMI",
            "--",
            "BMI score",
            0
        )

        self.create_stat_card(
            stats,
            "STATUS",
            "--",
            "Health category",
            1
        )

        self.create_stat_card(
            stats,
            "RECORDS",
            "0",
            "Saved measurements",
            2
        )

        # ---------- MAIN AREA ----------

        main = tk.Frame(
            page,
            bg=self.bg
        )

        main.pack(
            fill="both",
            expand=True
        )

        # LEFT

        left = tk.Frame(
            main,
            bg=self.card
        )

        left.pack(
            side="left",
            fill="both",
            expand=True,
            padx=(0, 8)
        )

        tk.Label(
            left,
            text="User Profile",
            bg=self.card,
            fg=self.text,
            font=("Segoe UI", 14, "bold")
        ).pack(
            anchor="w",
            padx=20,
            pady=(18, 5)
        )

        tk.Label(
            left,
            text="Create a profile or select an existing user",
            bg=self.card,
            fg=self.muted,
            font=("Segoe UI", 9)
        ).pack(
            anchor="w",
            padx=20,
            pady=(0, 15)
        )

        profile = tk.Frame(
            left,
            bg=self.card
        )

        profile.pack(
            fill="x",
            padx=20
        )

        tk.Label(
            profile,
            text="Name",
            bg=self.card,
            fg=self.muted
        ).grid(
            row=0,
            column=0,
            sticky="w",
            pady=6
        )

        self.name_entry = ttk.Entry(
            profile,
            width=25
        )

        self.name_entry.grid(
            row=1,
            column=0,
            sticky="ew",
            pady=(0, 12)
        )

        ttk.Button(
            profile,
            text="Create / Select User",
            style="Accent.TButton",
            command=self.select_user
        ).grid(
            row=2,
            column=0,
            sticky="ew",
            pady=5
        )

        tk.Label(
            profile,
            text="Existing User",
            bg=self.card,
            fg=self.muted
        ).grid(
            row=3,
            column=0,
            sticky="w",
            pady=(15, 6)
        )

        self.user_combo = ttk.Combobox(
            profile,
            state="readonly"
        )

        self.user_combo.grid(
            row=4,
            column=0,
            sticky="ew"
        )

        self.user_combo.bind(
            "<<ComboboxSelected>>",
            self.change_user
        )

        profile.columnconfigure(
            0,
            weight=1
        )

        # ---------- CALCULATOR ----------

        calc = tk.Frame(
            left,
            bg=self.card2
        )

        calc.pack(
            fill="x",
            padx=20,
            pady=25
        )

        tk.Label(
            calc,
            text="BMI Calculator",
            bg=self.card2,
            fg=self.text,
            font=("Segoe UI", 13, "bold")
        ).pack(
            anchor="w",
            padx=15,
            pady=(15, 3)
        )

        tk.Label(
            calc,
            text="Enter your current measurements",
            bg=self.card2,
            fg=self.muted
        ).pack(
            anchor="w",
            padx=15,
            pady=(0, 15)
        )

        input_frame = tk.Frame(
            calc,
            bg=self.card2
        )

        input_frame.pack(
            fill="x",
            padx=15
        )

        tk.Label(
            input_frame,
            text="Weight (kg)",
            bg=self.card2,
            fg=self.muted
        ).grid(
            row=0,
            column=0,
            sticky="w"
        )

        tk.Label(
            input_frame,
            text="Height (m)",
            bg=self.card2,
            fg=self.muted
        ).grid(
            row=0,
            column=1,
            sticky="w",
            padx=15
        )

        self.weight_entry = ttk.Entry(
            input_frame
        )

        self.weight_entry.grid(
            row=1,
            column=0,
            sticky="ew",
            pady=7
        )

        self.height_entry = ttk.Entry(
            input_frame
        )

        self.height_entry.grid(
            row=1,
            column=1,
            sticky="ew",
            padx=15,
            pady=7
        )

        input_frame.columnconfigure(
            0,
            weight=1
        )

        input_frame.columnconfigure(
            1,
            weight=1
        )

        ttk.Button(
            calc,
            text="Calculate & Save BMI",
            style="Accent.TButton",
            command=self.calculate
        ).pack(
            fill="x",
            padx=15,
            pady=(10, 15)
        )

        # ---------- RIGHT RESULT ----------

        right = tk.Frame(
            main,
            bg=self.card
        )

        right.pack(
            side="right",
            fill="both",
            expand=True,
            padx=(8, 0)
        )

        tk.Label(
            right,
            text="Latest Health Result",
            bg=self.card,
            fg=self.text,
            font=("Segoe UI", 14, "bold")
        ).pack(
            anchor="w",
            padx=25,
            pady=(20, 5)
        )

        tk.Label(
            right,
            text="Your most recent BMI measurement",
            bg=self.card,
            fg=self.muted,
            font=("Segoe UI", 9)
        ).pack(
            anchor="w",
            padx=25
        )

        self.result_bmi = tk.Label(
            right,
            text="--",
            bg=self.card,
            fg=self.text,
            font=("Segoe UI", 54, "bold")
        )

        self.result_bmi.pack(
            pady=(35, 3)
        )

        self.result_status = tk.Label(
            right,
            text="No result yet",
            bg=self.card,
            fg=self.muted,
            font=("Segoe UI", 18, "bold")
        )

        self.result_status.pack()

        self.result_description = tk.Label(
            right,
            text="Create a user and calculate your BMI.",
            bg=self.card,
            fg=self.muted,
            font=("Segoe UI", 10),
            wraplength=380,
            justify="center"
        )

        self.result_description.pack(
            pady=12
        )

        # ---------- RANGE BAR ----------

        range_frame = tk.Frame(
            right,
            bg=self.card
        )

        range_frame.pack(
            fill="x",
            padx=35,
            pady=15
        )

        tk.Label(
            range_frame,
            text="BMI HEALTH RANGE",
            bg=self.card,
            fg=self.muted,
            font=("Segoe UI", 9, "bold")
        ).pack(
            anchor="w"
        )

        self.range_canvas = tk.Canvas(
            range_frame,
            height=25,
            bg=self.card,
            highlightthickness=0
        )

        self.range_canvas.pack(
            fill="x",
            pady=10
        )

        self.draw_bmi_range()

        self.detail_label = tk.Label(
            right,
            text="",
            bg=self.card,
            fg=self.muted,
            font=("Segoe UI", 10)
        )

        self.detail_label.pack(
            pady=10
        )

    # =====================================================
    # STAT CARD
    # =====================================================

    def create_stat_card(
        self,
        parent,
        title,
        value,
        subtitle,
        column
    ):

        card = tk.Frame(
            parent,
            bg=self.card
        )

        card.grid(
            row=0,
            column=column,
            sticky="nsew",
            padx=5
        )

        parent.columnconfigure(
            column,
            weight=1
        )

        tk.Label(
            card,
            text=title,
            bg=self.card,
            fg=self.muted,
            font=("Segoe UI", 9, "bold")
        ).pack(
            anchor="w",
            padx=18,
            pady=(14, 2)
        )

        label = tk.Label(
            card,
            text=value,
            bg=self.card,
            fg=self.text,
            font=("Segoe UI", 21, "bold")
        )

        label.pack(
            anchor="w",
            padx=18
        )

        tk.Label(
            card,
            text=subtitle,
            bg=self.card,
            fg=self.muted,
            font=("Segoe UI", 8)
        ).pack(
            anchor="w",
            padx=18,
            pady=(0, 14)
        )

        setattr(
            self,
            f"stat_{column}",
            label
        )

    # =====================================================
    # BMI RANGE
    # =====================================================

    def draw_bmi_range(self):

        self.range_canvas.delete("all")

        width = 420
        height = 20

        sections = [
            (0, 18.5, "#38bdf8"),
            (18.5, 25, "#22c55e"),
            (25, 30, "#f59e0b"),
            (30, 40, "#ef4444")
        ]

        for start, end, color in sections:

            x1 = (start / 40) * width
            x2 = (end / 40) * width

            self.range_canvas.create_rectangle(
                x1,
                2,
                x2,
                height,
                fill=color,
                outline=""
            )

        self.range_canvas.create_text(
            10,
            12,
            text="Under",
            fill="#ffffff",
            anchor="w",
            font=("Segoe UI", 7, "bold")
        )

        self.range_canvas.create_text(
            205,
            12,
            text="Normal",
            fill="#ffffff",
            font=("Segoe UI", 7, "bold")
        )

        self.range_canvas.create_text(
            285,
            12,
            text="Over",
            fill="#ffffff",
            font=("Segoe UI", 7, "bold")
        )

        self.range_canvas.create_text(
            375,
            12,
            text="Obese",
            fill="#ffffff",
            font=("Segoe UI", 7, "bold")
        )

    # =====================================================
    # USER
    # =====================================================

    def select_user(self):

        name = self.name_entry.get().strip()

        if not name:
            messagebox.showwarning(
                "Missing Name",
                "Please enter a user name."
            )
            return

        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id FROM users WHERE name = ?",
            (name,)
        )

        user = cursor.fetchone()

        if user:
            self.user_id = user[0]
        else:
            cursor.execute(
                "INSERT INTO users (name) VALUES (?)",
                (name,)
            )

            self.user_id = cursor.lastrowid

        conn.commit()
        conn.close()

        self.user_name = name

        self.user_badge.config(
            text=f"●  {name}",
            fg=self.success
        )

        self.name_entry.delete(
            0,
            tk.END
        )

        self.load_users()
        self.load_latest()
        self.update_stats()

    def load_users(self):

        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        cursor.execute(
            "SELECT name FROM users ORDER BY name"
        )

        users = [
            row[0]
            for row in cursor.fetchall()
        ]

        conn.close()

        self.user_combo["values"] = users

        if self.user_name in users:
            self.user_combo.set(
                self.user_name
            )

    def change_user(self, event=None):

        name = self.user_combo.get()

        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id FROM users WHERE name = ?",
            (name,)
        )

        user = cursor.fetchone()

        conn.close()

        if user:

            self.user_id = user[0]
            self.user_name = name

            self.user_badge.config(
                text=f"●  {name}",
                fg=self.success
            )

            self.load_latest()
            self.update_stats()

    # =====================================================
    # CALCULATE
    # =====================================================

    def calculate(self):

        if not self.user_id:

            messagebox.showwarning(
                "Select User",
                "Please create or select a user first."
            )

            return

        try:

            weight = float(
                self.weight_entry.get().strip()
            )

            height = float(
                self.height_entry.get().strip()
            )

            if weight <= 0 or height <= 0:

                raise ValueError

            if height > 3:

                messagebox.showwarning(
                    "Height Format",
                    "Enter height in meters.\n\n"
                    "Example: 175 cm = 1.75 m"
                )

                return

            bmi = calculate_bmi(
                weight,
                height
            )

            category = get_category(
                bmi
            )

            recorded_at = datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            )

            conn = sqlite3.connect(
                DB_NAME
            )

            cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO bmi_records
                (
                    user_id,
                    weight,
                    height,
                    bmi,
                    category,
                    recorded_at
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    self.user_id,
                    weight,
                    height,
                    bmi,
                    category,
                    recorded_at
                )
            )

            conn.commit()
            conn.close()

            self.show_result(
                weight,
                height,
                bmi,
                category
            )

            self.weight_entry.delete(
                0,
                tk.END
            )

            self.height_entry.delete(
                0,
                tk.END
            )

            self.update_stats()

            messagebox.showinfo(
                "BMI Saved",
                f"BMI {bmi} saved successfully."
            )

        except ValueError:

            messagebox.showerror(
                "Invalid Input",
                "Please enter valid positive numbers.\n\n"
                "Example:\n"
                "Weight: 70\n"
                "Height: 1.75"
            )

    # =====================================================
    # SHOW RESULT
    # =====================================================

    def show_result(
        self,
        weight,
        height,
        bmi,
        category
    ):

        color = get_category_color(
            category
        )

        self.result_bmi.config(
            text=f"{bmi:.2f}",
            fg=color
        )

        self.result_status.config(
            text=category,
            fg=color
        )

        self.result_description.config(
            text=get_category_description(
                category
            )
        )

        self.detail_label.config(
            text=(
                f"Weight  {weight:.1f} kg"
                f"     •     "
                f"Height  {height:.2f} m"
            )
        )

        self.stat_0.config(
            text=f"{bmi:.2f}"
        )

        self.stat_1.config(
            text=category,
            fg=color
        )

    # =====================================================
    # LOAD LATEST
    # =====================================================

    def load_latest(self):

        if not self.user_id:
            return

        conn = sqlite3.connect(
            DB_NAME
        )

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT weight, height, bmi, category
            FROM bmi_records
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (self.user_id,)
        )

        record = cursor.fetchone()

        conn.close()

        if record:

            self.show_result(
                record[0],
                record[1],
                record[2],
                record[3]
            )

        else:

            self.result_bmi.config(
                text="--",
                fg=self.text
            )

            self.result_status.config(
                text="No result yet",
                fg=self.muted
            )

            self.result_description.config(
                text="Calculate your first BMI measurement."
            )

            self.detail_label.config(
                text=""
            )

    # =====================================================
    # STATS
    # =====================================================

    def update_stats(self):

        if not self.user_id:
            return

        conn = sqlite3.connect(
            DB_NAME
        )

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM bmi_records
            WHERE user_id = ?
            """,
            (self.user_id,)
        )

        count = cursor.fetchone()[0]

        conn.close()

        self.stat_2.config(
            text=str(count)
        )

    # =====================================================
    # HISTORY
    # =====================================================

    def build_history(self):

        page = self.history_page

        header = tk.Frame(
            page,
            bg=self.bg
        )

        header.pack(
            fill="x",
            pady=(0, 15)
        )

        tk.Label(
            header,
            text="History & Analytics",
            bg=self.bg,
            fg=self.text,
            font=("Segoe UI", 22, "bold")
        ).pack(
            side="left"
        )

        ttk.Button(
            header,
            text="Export CSV",
            command=self.export_csv
        ).pack(
            side="right",
            padx=5
        )

        ttk.Button(
            header,
            text="Refresh",
            command=self.refresh_history
        ).pack(
            side="right",
            padx=5
        )

        # TABLE

        table_card = tk.Frame(
            page,
            bg=self.card
        )

        table_card.pack(
            fill="x",
            pady=(0, 15)
        )

        tk.Label(
            table_card,
            text="Measurement History",
            bg=self.card,
            fg=self.text,
            font=("Segoe UI", 13, "bold")
        ).pack(
            anchor="w",
            padx=15,
            pady=12
        )

        columns = (
            "weight",
            "height",
            "bmi",
            "category",
            "date"
        )

        self.table = ttk.Treeview(
            table_card,
            columns=columns,
            show="headings",
            height=7
        )

        headings = {
            "weight": "Weight (kg)",
            "height": "Height (m)",
            "bmi": "BMI",
            "category": "Category",
            "date": "Recorded At"
        }

        for col in columns:

            self.table.heading(
                col,
                text=headings[col]
            )

            self.table.column(
                col,
                width=150,
                anchor="center"
            )

        self.table.pack(
            fill="x",
            padx=10,
            pady=(0, 15)
        )

        # CHART

        chart_card = tk.Frame(
            page,
            bg=self.card
        )

        chart_card.pack(
            fill="both",
            expand=True
        )

        tk.Label(
            chart_card,
            text="BMI Progress Trend",
            bg=self.card,
            fg=self.text,
            font=("Segoe UI", 13, "bold")
        ).pack(
            anchor="w",
            padx=15,
            pady=12
        )

        self.chart_frame = tk.Frame(
            chart_card,
            bg=self.card
        )

        self.chart_frame.pack(
            fill="both",
            expand=True
        )

    # =====================================================
    # REFRESH HISTORY
    # =====================================================

    def refresh_history(self):

        if not hasattr(
            self,
            "table"
        ):
            return

        for item in self.table.get_children():

            self.table.delete(item)

        for widget in self.chart_frame.winfo_children():

            widget.destroy()

        if not self.user_id:
            return

        conn = sqlite3.connect(
            DB_NAME
        )

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                weight,
                height,
                bmi,
                category,
                recorded_at
            FROM bmi_records
            WHERE user_id = ?
            ORDER BY recorded_at ASC
            """,
            (self.user_id,)
        )

        records = cursor.fetchall()

        conn.close()

        for record in reversed(records):

            self.table.insert(
                "",
                "end",
                values=(
                    f"{record[0]:.1f}",
                    f"{record[1]:.2f}",
                    f"{record[2]:.2f}",
                    record[3],
                    record[4]
                )
            )

        if records:

            self.create_chart(
                records
            )

    # =====================================================
    # CHART
    # =====================================================

    def create_chart(
        self,
        records
    ):

        figure = plt.Figure(
            figsize=(8, 3.2),
            dpi=100,
            facecolor=self.card
        )

        axis = figure.add_subplot(111)

        axis.set_facecolor(
            self.card
        )

        values = [
            record[2]
            for record in records
        ]

        x = list(
            range(
                1,
                len(values) + 1
            )
        )

        axis.plot(
            x,
            values,
            marker="o",
            linewidth=2.5,
            color=self.accent
        )

        axis.axhspan(
            18.5,
            24.9,
            color=self.success,
            alpha=0.08
        )

        axis.set_title(
            "BMI Progress",
            color=self.text,
            fontsize=12
        )

        axis.set_xlabel(
            "Measurement",
            color=self.muted
        )

        axis.set_ylabel(
            "BMI",
            color=self.muted
        )

        axis.tick_params(
            colors=self.muted
        )

        for spine in axis.spines.values():

            spine.set_color(
                self.border
            )

        axis.grid(
            True,
            alpha=0.12
        )

        figure.tight_layout()

        canvas = FigureCanvasTkAgg(
            figure,
            master=self.chart_frame
        )

        canvas.draw()

        canvas.get_tk_widget().pack(
            fill="both",
            expand=True,
            padx=15,
            pady=10
        )

    # =====================================================
    # CSV EXPORT
    # =====================================================

    def export_csv(self):

        if not self.user_id:

            messagebox.showwarning(
                "Select User",
                "Please select a user first."
            )

            return

        conn = sqlite3.connect(
            DB_NAME
        )

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                weight,
                height,
                bmi,
                category,
                recorded_at
            FROM bmi_records
            WHERE user_id = ?
            ORDER BY recorded_at ASC
            """,
            (self.user_id,)
        )

        records = cursor.fetchall()

        conn.close()

        if not records:

            messagebox.showinfo(
                "No Records",
                "There are no BMI records to export."
            )

            return

        filename = filedialog.asksaveasfilename(
            title="Export BMI History",
            defaultextension=".csv",
            initialfile=f"{self.user_name}_BMI_History.csv",
            filetypes=[
                ("CSV Files", "*.csv"),
                ("All Files", "*.*")
            ]
        )

        if not filename:
            return

        try:

            with open(
                filename,
                "w",
                newline="",
                encoding="utf-8"
            ) as file:

                writer = csv.writer(
                    file
                )

                writer.writerow([
                    "Weight (kg)",
                    "Height (m)",
                    "BMI",
                    "Category",
                    "Recorded At"
                ])

                writer.writerows(
                    records
                )

            messagebox.showinfo(
                "Export Complete",
                "BMI history exported successfully."
            )

        except OSError as error:

            messagebox.showerror(
                "Export Error",
                str(error)
            )


# =========================================================
# START
# =========================================================

if __name__ == "__main__":

    root = tk.Tk()

    app = FitTrackPro(
        root
    )

    root.mainloop()