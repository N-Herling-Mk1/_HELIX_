"""
HELIX Tray Launcher — helix_tray.py
"""
import sys, os, subprocess, webbrowser, math, traceback, time
from pathlib import Path

try:
    from PyQt6.QtWidgets import (
        QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
        QLabel, QSystemTrayIcon, QMenu, QFrame, QPushButton, QMessageBox
    )
    from PyQt6.QtCore  import Qt, QThread, pyqtSignal, QTimer, QRectF, QPointF, QEvent
    from PyQt6.QtGui   import (
        QColor, QFont, QIcon, QPixmap, QPainter, QPen, QBrush,
        QAction, QLinearGradient, QPolygonF, QPainterPath
    )
except ImportError as e:
    try:
        import tkinter, tkinter.messagebox
        tkinter.Tk().withdraw()
        tkinter.messagebox.showerror("HELIX", f"pip install pyqt6\n{e}")
    except Exception: print(f"pip install pyqt6\n{e}")
    sys.exit(1)

try:    ROOT = Path(__file__).parent
except: ROOT = Path.cwd()

BAT_FILE  = ROOT / "run_helix.bat"
CTRL_URL  = "http://localhost:5000/control"
PING_URL  = "http://localhost:5000/ping"
PORT      = 5000

# ── audio ─────────────────────────────────────────────────────────────────────
SFX_START = str(ROOT / "assets" / "audio" / "muscle_car_power_up.wav")
SFX_STOP  = str(ROOT / "assets" / "audio" / "muscle_car_power_up.wav")

def play_sfx(path):
    try:
        import winsound
        if os.path.exists(path):
            winsound.PlaySound(path, winsound.SND_FILENAME | winsound.SND_ASYNC)
    except Exception as e:
        print(f"[WARN] audio: {e}")

C = {
    "bg":"#020c14","bg2":"#060f1a","bg3":"#0a1520",
    "border":"#0d2235","border2":"#1a3a55","dim":"#1e4060",
    "text":"#c8dce8","text2":"#4a6880",
    "cyan":"#00e5ff","ok":"#00ff41","err":"#ff2255",
    "warn":"#ff6a00","purple":"#b044ff",
}

INFO_LINES = [
    ("WHAT IS THIS?",                   "cyan"),
    ("HELIX Backend Helper launches",   "text"),
    ("your local Flask server and",     "text"),
    ("opens the control panel in",      "text"),
    ("your browser.",                   "text"),
    ("",                                "text"),
    ("STEP 1",                          "ok"),
    ("Click  FIRE IT UP.",              "text"),
    ("",                                "text"),
    ("STEP 2",                          "ok"),
    ("Browser opens automatically.",    "text"),
    ("",                                "text"),
    ("STEP 3",                          "ok"),
    ("Use the control panel to open",   "text"),
    ("the editor, view the site,",      "text"),
    ("and manage content.",             "text"),
    ("",                                "text"),
    ("TRAY ICON",                       "warn"),
    ("Close this window to minimise.",  "text"),
    ("Right-click tray icon to quit.",  "text"),
]

# ── icon ──────────────────────────────────────────────────────────────────────
def make_icon(active=False):
    try:
        ico = ROOT/"assets"/"img"/"helix_64.ico"
        if ico.exists(): return QIcon(str(ico))
    except Exception: pass
    try:
        px = QPixmap(32,32); px.fill(Qt.GlobalColor.transparent)
        p = QPainter(px); p.setRenderHint(QPainter.RenderHint.Antialiasing)
        col = QColor(C["ok"] if active else C["cyan"])
        p.setPen(QPen(col,1.5)); p.setBrush(QBrush(Qt.GlobalColor.transparent))
        cx,cy,r=16,16,13
        pts=[QPointF(cx+r*math.cos(math.radians(60*i-30)),
                     cy+r*math.sin(math.radians(60*i-30))) for i in range(6)]
        p.drawPolygon(QPolygonF(pts))
        p.setPen(QPen(col,2))
        p.drawLine(11,10,11,22);p.drawLine(21,10,21,22);p.drawLine(11,16,21,16)
        p.end(); return QIcon(px)
    except Exception: return QIcon()

# ── bat thread ────────────────────────────────────────────────────────────────
class BatThread(QThread):
    log_line  = pyqtSignal(str)
    finished_ = pyqtSignal(bool)

    def run(self):
        try:
            subprocess.Popen(
                ["cmd.exe", "/c", str(BAT_FILE)],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                cwd=str(ROOT), creationflags=subprocess.CREATE_NO_WINDOW
            )
            self.log_line.emit("[SYS] Waiting for server on :5000 ...")
            alive = self._ping(retries=25, delay=0.7)
            self.log_line.emit("[OK]  Server live." if alive else "[ERR] Timed out.")
            self.finished_.emit(alive)
        except Exception as e:
            self.log_line.emit(f"[ERR] {e}")
            self.finished_.emit(False)

    def _ping(self, retries=25, delay=0.7):
        import urllib.request
        for _ in range(retries):
            try:
                urllib.request.urlopen(PING_URL, timeout=1)
                return True
            except Exception:
                time.sleep(delay)
        return False

# ── fire button ───────────────────────────────────────────────────────────────
class FireButton(QPushButton):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._hover  = False
        self._press  = False
        self._phase  = 0.0
        self._state  = "idle"
        self._radius = 62.0          # animated radius for expand on hover
        self.setFixedSize(200, 200)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setFlat(True)
        self.setStyleSheet("background:transparent;border:none;color:transparent;")
        self.setAttribute(Qt.WidgetAttribute.WA_Hover, True)
        self._timer = QTimer()
        self._timer.timeout.connect(self._tick)
        self._timer.start(30)

    def set_state(self, s):
        self._state = s
        self.update()

    def _tick(self):
        self._phase = (self._phase + 0.06) % (2 * math.pi)
        # smooth radius expand/contract
        target = 68.0 if (self._hover or self._state == "running") else 62.0
        self._radius += (target - self._radius) * 0.12
        self.update()

    def event(self, e):
        if e.type() == QEvent.Type.HoverEnter:  self._hover=True;  self.update()
        elif e.type() == QEvent.Type.HoverLeave: self._hover=False; self.update()
        return super().event(e)

    def mousePressEvent(self,e):
        self._press=True;  self.update(); super().mousePressEvent(e)
    def mouseReleaseEvent(self,e):
        self._press=False; self.update(); super().mouseReleaseEvent(e)

    def paintEvent(self, e):
        try:
            p = QPainter(self)
            p.setRenderHint(QPainter.RenderHint.Antialiasing)
            w, h  = self.width(), self.height()
            cx, cy = w/2, h/2
            ph     = self._phase
            pulse  = 0.5 + 0.5*math.sin(ph)
            mr     = self._radius
            press_offset = -2 if self._press else 0

            STATE_COLORS = {
                "idle":    C["cyan"],
                "running": C["warn"],
                "live":    C["ok"],
                "failed":  C["err"],
            }
            col = QColor(STATE_COLORS.get(self._state, C["cyan"]))

            # ── soft glow rings ───────────────────────────────────────────────
            p.setPen(Qt.PenStyle.NoPen)
            for r_off, base_a in [(mr+18,0.03),(mr+10,0.06),(mr+4,0.10)]:
                ga = base_a * (0.5 + 0.5*pulse) * (1.4 if self._hover else 1.0)
                gc = QColor(col); gc.setAlphaF(ga)
                p.setBrush(gc)
                p.drawEllipse(QPointF(cx, cy+press_offset), r_off, r_off)

            # ── main filled circle ─────────────────────────────────────────
            fa = 0.20 if self._press else (0.12 if self._hover else 0.07)
            fc = QColor(col); fc.setAlphaF(fa)
            p.setBrush(fc)
            ba = 0.9 if self._hover else 0.5
            bc = QColor(col); bc.setAlphaF(ba)
            p.setPen(QPen(bc, 2.0 if self._hover else 1.4))
            p.drawEllipse(QPointF(cx, cy+press_offset), mr, mr)

            # ── HOVER: two oppositely rotating partial arc segments ───────────
            if self._hover and self._state in ("idle", "failed"):
                arc_r = mr + 10
                span  = 110 * 16     # degrees * 16 (Qt units)
                gap   = 70  * 16     # gap between segments

                # arc 1 — rotates clockwise
                a1_start = int(ph * (180/math.pi) * 16 * 1.8) % (360*16)
                # arc 2 — rotates counter-clockwise
                a2_start = int(-ph * (180/math.pi) * 16 * 1.8 + 180*16) % (360*16)

                arc_col = QColor(col); arc_col.setAlphaF(0.75)
                p.setPen(QPen(arc_col, 2.5, Qt.PenStyle.SolidLine,
                              Qt.PenCapStyle.RoundCap))
                p.setBrush(Qt.BrushStyle.NoBrush)
                rect_r = int(arc_r)
                arc_rect_x = int(cx - rect_r)
                arc_rect_y = int(cy + press_offset - rect_r)
                arc_rect_w = rect_r * 2
                p.drawArc(arc_rect_x, arc_rect_y, arc_rect_w, arc_rect_w,
                          a1_start, span)
                p.drawArc(arc_rect_x, arc_rect_y, arc_rect_w, arc_rect_w,
                          a2_start, span)

                # outer thinner arcs at larger radius
                arc_r2 = mr + 17
                arc_col2 = QColor(col); arc_col2.setAlphaF(0.30)
                p.setPen(QPen(arc_col2, 1.2, Qt.PenStyle.SolidLine,
                              Qt.PenCapStyle.RoundCap))
                rect_r2  = int(arc_r2)
                arc_rect2_x = int(cx - rect_r2)
                arc_rect2_y = int(cy + press_offset - rect_r2)
                arc_rect2_w = rect_r2 * 2
                span2 = 70 * 16
                p.drawArc(arc_rect2_x, arc_rect2_y, arc_rect2_w, arc_rect2_w,
                          a1_start + 20*16, span2)
                p.drawArc(arc_rect2_x, arc_rect2_y, arc_rect2_w, arc_rect2_w,
                          a2_start + 20*16, span2)

            # ── RUNNING: single fast spinning arc ─────────────────────────────
            if self._state == "running":
                arc_r = mr + 10
                ac = QColor(col); ac.setAlphaF(0.85)
                p.setPen(QPen(ac, 2.5, Qt.PenStyle.SolidLine,
                              Qt.PenCapStyle.RoundCap))
                p.setBrush(Qt.BrushStyle.NoBrush)
                fast = int(ph * (180/math.pi) * 16 * 3.5) % (360*16)
                rr = int(arc_r)
                p.drawArc(int(cx-rr), int(cy-rr), rr*2, rr*2, fast, 220*16)
                # counter arc
                ac2 = QColor(col); ac2.setAlphaF(0.3)
                p.setPen(QPen(ac2, 1.2))
                rr2 = int(arc_r + 7)
                p.drawArc(int(cx-rr2), int(cy-rr2), rr2*2, rr2*2,
                          -fast//2, 130*16)

            # ── LIVE: gentle pulse ring ────────────────────────────────────────
            if self._state == "live":
                lc = QColor(col); lc.setAlphaF(0.15 + 0.18*pulse)
                p.setPen(QPen(lc, 1.2))
                p.setBrush(Qt.BrushStyle.NoBrush)
                p.drawEllipse(QPointF(cx, cy), mr+8, mr+8)

            # ── label — ALWAYS "FIRE IT UP!" until state changes ──────────────
            if self._state == "live":
                lbl, sub = "LIVE  ✓",  "click to open"
            elif self._state == "running":
                lbl, sub = "STARTING", "please wait"
            elif self._state == "failed":
                lbl, sub = "FAILED",   "check log"
            else:
                lbl, sub = "FIRE IT UP!", ""

            tc = QColor(col if self._hover else C["text"])
            f = QFont("Orbitron", 11 if len(lbl)>8 else 12)
            f.setBold(True)
            f.setLetterSpacing(QFont.SpacingType.AbsoluteSpacing, 1.5)
            p.setFont(f); p.setPen(tc)
            label_y = cy - 8 if sub else cy - 6
            p.drawText(QRectF(0, label_y+press_offset, w, 22),
                       Qt.AlignmentFlag.AlignCenter, lbl)

            if sub:
                f2 = QFont("Courier New", 8)
                f2.setLetterSpacing(QFont.SpacingType.AbsoluteSpacing, 1.5)
                sc = QColor(col); sc.setAlphaF(0.55 if self._hover else 0.35)
                p.setFont(f2); p.setPen(sc)
                p.drawText(QRectF(0, cy+7+press_offset, w, 14),
                           Qt.AlignmentFlag.AlignCenter, sub)
            p.end()
        except Exception: pass


# ── status dot ────────────────────────────────────────────────────────────────
class StatusDot(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._live=False; self._phase=0.0; self.setFixedSize(12,12)
        self._timer=QTimer(); self._timer.timeout.connect(self._tick); self._timer.start(50)
    def _tick(self): self._phase=(self._phase+0.08)%(2*math.pi); self.update()
    def set_live(self,v): self._live=v; self.update()
    def paintEvent(self,e):
        try:
            p=QPainter(self); p.setRenderHint(QPainter.RenderHint.Antialiasing)
            col=QColor(C["ok"] if self._live else C["err"])
            pulse=0.5+0.5*math.sin(self._phase)
            g=QColor(col); g.setAlphaF(0.25*pulse)
            p.setPen(Qt.PenStyle.NoPen); p.setBrush(g); p.drawEllipse(0,0,12,12)
            p.setBrush(col); p.drawEllipse(2,2,8,8); p.end()
        except Exception: pass

# ── kill button (image-based) ────────────────────────────────────────────────
class KillButton(QPushButton):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._hover=False; self._press=False; self._active=False
        self._phase=0.0;   self._pixmap=None
        self.setFixedSize(160,160)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setFlat(True)
        self.setStyleSheet("background:transparent;border:none;")
        self.setAttribute(Qt.WidgetAttribute.WA_Hover, True)
        try:
            ip=ROOT/"assets"/"img"/"kill_process.png"
            if ip.exists():
                px=QPixmap(str(ip))
                if not px.isNull():
                    self._pixmap=px.scaled(140,140,
                        Qt.AspectRatioMode.KeepAspectRatio,
                        Qt.TransformationMode.SmoothTransformation)
        except Exception: pass
        self._timer=QTimer(); self._timer.timeout.connect(self._tick); self._timer.start(40)

    def set_active(self,v): self._active=v; self.update()
    def _tick(self): self._phase=(self._phase+0.07)%(2*math.pi); self.update()

    def event(self,e):
        if e.type()==QEvent.Type.HoverEnter:  self._hover=True;  self.update()
        elif e.type()==QEvent.Type.HoverLeave: self._hover=False; self.update()
        return super().event(e)

    def mousePressEvent(self,e):
        if self._active: self._press=True; self.update(); super().mousePressEvent(e)
    def mouseReleaseEvent(self,e):
        self._press=False; self.update()
        if self._active: super().mouseReleaseEvent(e)

    def paintEvent(self,e):
        try:
            p=QPainter(self); p.setRenderHint(QPainter.RenderHint.Antialiasing)
            w,h=self.width(),self.height(); cx,cy=w/2,h/2
            pulse=0.5+0.5*math.sin(self._phase)
            if self._pixmap:
                ox=(w-self._pixmap.width())//2; oy=(h-self._pixmap.height())//2
                op=0.20 if not self._active else (0.75 if self._press else (1.0 if self._hover else 0.70))
                p.setOpacity(op); p.drawPixmap(ox,oy,self._pixmap); p.setOpacity(1.0)
            else:
                col=QColor(C["err"] if self._active else C["dim"])
                fc=QColor(col);fc.setAlphaF(0.08);p.setBrush(fc)
                bc=QColor(col);bc.setAlphaF(0.5 if self._active else 0.2)
                p.setPen(QPen(bc,1.5));p.drawEllipse(QPointF(cx,cy),55,55)
            if self._active and self._hover:
                gc=QColor(C["err"]);gc.setAlphaF(0.20+0.12*pulse)
                p.setPen(QPen(gc,2.0));p.setBrush(Qt.BrushStyle.NoBrush)
                p.drawEllipse(QPointF(cx,cy),72,72)
            if self._active and self._press:
                pc=QColor(C["err"]);pc.setAlphaF(0.28)
                p.setPen(Qt.PenStyle.NoPen);p.setBrush(pc)
                p.drawEllipse(QPointF(cx,cy),66,66)
            p.end()
        except Exception: pass


# ── main window ───────────────────────────────────────────────────────────────
class HelixLauncher(QMainWindow):
    def __init__(self):
        super().__init__()
        self._thread=None; self._running=False; self._tray=None; self._ping_timer=None
        try:
            self.setWindowTitle("H·E·L·I·X")
            self.setFixedSize(660,440)
            self.setWindowFlags(Qt.WindowType.Window|Qt.WindowType.WindowCloseButtonHint)
            self.setStyleSheet(f"QMainWindow{{background:{C['bg']};}} QWidget{{background:transparent;}}")
            ico=ROOT/"assets"/"img"/"helix_64.ico"
            if ico.exists(): self.setWindowIcon(QIcon(str(ico)))
        except Exception: pass
        try: self._build_ui()
        except Exception: print(traceback.format_exc())
        try: self._build_tray()
        except Exception as e: print(f"tray: {e}")
        # check if already running
        QTimer.singleShot(500, self._startup_check)

    def paintEvent(self, e):
        try:
            p=QPainter(self); p.setRenderHint(QPainter.RenderHint.Antialiasing)
            w,h=self.width(),self.height()
            grad=QLinearGradient(0,0,0,h)
            grad.setColorAt(0,QColor(C["bg"])); grad.setColorAt(1,QColor("#010810"))
            p.fillRect(0,0,w,h,grad)
            dc=QColor(C["cyan"]); dc.setAlphaF(0.03); p.setPen(QPen(dc,1.5))
            for gx in range(0,w,30):
                for gy in range(0,h,30): p.drawPoint(gx,gy)
            cc=QColor(C["cyan"]); cc.setAlphaF(0.18); p.setPen(QPen(cc,1)); s=22
            for (x,y,dx,dy) in [(0,0,1,1),(w,0,-1,1),(0,h,1,-1),(w,h,-1,-1)]:
                p.drawLine(x,y+dy*7,x,y+dy*(s+7)); p.drawLine(x+dx*7,y,x+dx*(s+7),y)
            lc=QColor(C["border2"]); p.setPen(QPen(lc,1)); p.drawLine(320,20,320,h-20)
            bc=QColor(C["cyan"]); bc.setAlphaF(0.08); p.fillRect(0,h-2,w,2,bc)
            p.end()
        except Exception: pass

    def _build_ui(self):
        root=QWidget(); self.setCentralWidget(root)
        outer=QHBoxLayout(root); outer.setContentsMargins(0,0,0,0); outer.setSpacing(0)

        # LEFT
        left=QVBoxLayout(); left.setContentsMargins(20,20,20,16); left.setSpacing(0)
        left.setAlignment(Qt.AlignmentFlag.AlignHCenter)

        logo_lbl=QLabel(); logo_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        logo_lbl.setFixedWidth(240)
        try:
            lp=ROOT/"assets"/"img"/"Soc_media_tag.png"
            if lp.exists():
                px=QPixmap(str(lp))
                if not px.isNull():
                    px=px.scaledToWidth(200,Qt.TransformationMode.SmoothTransformation)
                    logo_lbl.setPixmap(px); logo_lbl.setFixedHeight(px.height())
        except Exception:
            logo_lbl.setText("H·E·L·I·X")
            logo_lbl.setStyleSheet(f"font-family:'Orbitron';font-size:18px;font-weight:900;color:{C['cyan']};")
        left.addWidget(logo_lbl,0,Qt.AlignmentFlag.AlignHCenter)
        left.addSpacing(10)

        sr=QHBoxLayout(); sr.setContentsMargins(0,0,0,0); sr.setSpacing(6)
        self._dot=StatusDot()
        self._status_lbl=QLabel("CHECKING...")
        self._status_lbl.setStyleSheet(
            f"font-family:'Courier New';font-size:10px;letter-spacing:3px;color:{C['text2']};")
        sr.addStretch(); sr.addWidget(self._dot); sr.addSpacing(5)
        sr.addWidget(self._status_lbl); sr.addStretch()
        left.addLayout(sr)
        left.addSpacing(12)

        # side-by-side: FIRE | KILL
        self._fire_btn=FireButton()
        if not BAT_FILE.exists(): self._fire_btn.set_state("failed")
        self._fire_btn.clicked.connect(self._on_fire)
        self._kill_btn=KillButton()
        self._kill_btn.set_active(False)
        self._kill_btn.clicked.connect(self._kill_server)
        btn_row=QHBoxLayout(); btn_row.setSpacing(4); btn_row.setContentsMargins(0,0,0,0)
        btn_row.addStretch()
        btn_row.addWidget(self._fire_btn)
        btn_row.addWidget(self._kill_btn)
        btn_row.addStretch()
        left.addLayout(btn_row)
        left.addSpacing(6)

        if not BAT_FILE.exists():
            wl=QLabel("⚠  run_helix.bat not found")
            wl.setAlignment(Qt.AlignmentFlag.AlignCenter)
            wl.setStyleSheet(f"font-family:'Courier New';font-size:9px;color:{C['warn']};")
            left.addWidget(wl)

        ver=QLabel("v1.0  ·  N.HERLING  ·  UA  ATLAS")
        ver.setStyleSheet(f"font-family:'Courier New';font-size:9px;letter-spacing:2px;color:{C['dim']};")
        ver.setAlignment(Qt.AlignmentFlag.AlignCenter)
        left.addWidget(ver); left.addStretch()
        lw=QWidget(); lw.setFixedWidth(320); lw.setLayout(left)
        outer.addWidget(lw)

        # RIGHT
        right=QVBoxLayout(); right.setContentsMargins(20,20,16,16); right.setSpacing(4)
        hdr=QLabel("HOW  IT  WORKS")
        hdr.setStyleSheet(
            f"font-family:'Orbitron';font-size:10px;font-weight:700;"
            f"letter-spacing:4px;color:{C['cyan']};margin-bottom:6px;")
        right.addWidget(hdr); right.addSpacing(4)
        for text,ck in INFO_LINES:
            lbl=QLabel(text)
            col=C.get(ck,C["text"])
            sp="3px" if ck in ("cyan","ok","warn") else "1px"
            lbl.setStyleSheet(
                f"font-family:'Courier New';font-size:9px;letter-spacing:{sp};color:{col};")
            right.addWidget(lbl)
        right.addStretch()
        rw=QWidget(); rw.setLayout(right); outer.addWidget(rw,1)

    def _build_tray(self):
        self._tray=QSystemTrayIcon(make_icon(False),self)
        self._tray.setToolTip("HELIX")
        menu=QMenu()
        for lbl,fn in [("Show",self.show),(None,None),
                       ("Open Control Panel",self._open_control),
                       (None,None),("Quit",self._quit)]:
            if lbl is None: menu.addSeparator()
            else: a=QAction(lbl,self);a.triggered.connect(fn);menu.addAction(a)
        self._tray.setContextMenu(menu)
        self._tray.activated.connect(
            lambda r: self.show() if r==QSystemTrayIcon.ActivationReason.DoubleClick else None)
        self._tray.show()

    # ── state ─────────────────────────────────────────────────────────────────
    def _startup_check(self):
        import urllib.request
        try:
            urllib.request.urlopen(PING_URL, timeout=1)
            self._go_live("ALREADY LIVE")
        except Exception:
            self._set_status(False,"OFFLINE")

    def _go_live(self, msg="LIVE"):
        self._running=True
        self._fire_btn.set_state("live")
        self._set_status(True, msg)
        if self._tray: self._tray.setIcon(make_icon(True))
        if hasattr(self,"_kill_btn"): self._kill_btn.set_active(True)
        play_sfx(SFX_START)
        self._start_poll()

    def _start_poll(self):
        if self._ping_timer and self._ping_timer.isActive(): return
        self._ping_timer=QTimer()
        self._ping_timer.timeout.connect(self._poll)
        self._ping_timer.start(4000)

    def _poll(self):
        import urllib.request
        try:
            urllib.request.urlopen(PING_URL,timeout=1)
            if not self._running: self._go_live()
        except Exception:
            if self._running:
                self._running=False
                self._fire_btn.set_state("idle")
                self._set_status(False,"SERVER STOPPED")
                if self._tray: self._tray.setIcon(make_icon(False))
                if hasattr(self,"_kill_btn"): self._kill_btn.set_active(False)
            if self._ping_timer: self._ping_timer.stop()

    def _set_status(self, live, text=""):
        col=C["ok"] if live else C["err"] if text not in ("CHECKING...","OFFLINE") else C["text2"]
        if not live and text in ("CHECKING...","OFFLINE"): col=C["text2"]
        if hasattr(self,"_dot"): self._dot.set_live(live)
        if hasattr(self,"_status_lbl"):
            self._status_lbl.setStyleSheet(
                f"font-family:'Courier New';font-size:10px;letter-spacing:3px;color:{col};")
            self._status_lbl.setText(text or ("LIVE" if live else "OFFLINE"))

    # ── actions ───────────────────────────────────────────────────────────────
    def _on_fire(self):
        if self._running:
            self._open_control(); return
        if not BAT_FILE.exists():
            self._set_status(False,"BAT NOT FOUND"); return
        self._fire_btn.set_state("running")
        self._set_status(False,"STARTING...")
        self._thread=BatThread()
        self._thread.log_line.connect(lambda l: print(l))
        self._thread.finished_.connect(self._on_finished)
        self._thread.start()

    def _on_finished(self, success):
        if success:
            self._go_live("LIVE")
            pass  # window stays open, user clicks to open browser
        else:
            self._running=False
            self._fire_btn.set_state("failed")
            self._set_status(False,"FAILED — check terminal")

    def _kill_server(self):
        """Call kill_helix.bat — kills any process on port 5000."""
        import urllib.request
        # try graceful shutdown endpoint first
        try:
            urllib.request.urlopen(
                f"http://localhost:{PORT}/api/shutdown", timeout=2)
        except Exception:
            pass
        # always run the bat kill as backup
        try:
            kill_bat = ROOT / "kill_helix.bat"
            if kill_bat.exists():
                subprocess.Popen(
                    ["cmd.exe", "/c", str(kill_bat)],
                    creationflags=subprocess.CREATE_NO_WINDOW,
                    cwd=str(ROOT))
        except Exception as e:
            print(f"[WARN] kill bat: {e}")
        play_sfx(SFX_STOP)
        # update UI immediately
        self._running = False
        self._fire_btn.set_state("idle")
        self._set_status(False, "STOPPED")
        if hasattr(self,"_kill_btn"): self._kill_btn.set_active(False)
        if self._tray: self._tray.setIcon(make_icon(False))
        if self._ping_timer: self._ping_timer.stop()

    def _open_control(self):
        try: webbrowser.open(CTRL_URL)
        except Exception as e: print(e)

    def _quit(self):
        try:
            if self._ping_timer: self._ping_timer.stop()
            if self._tray: self._tray.hide()
        except Exception: pass
        QApplication.quit()

    def closeEvent(self,e):
        # always stay open — Quit via tray menu only
        e.ignore()
        self.showNormal()
        self.activateWindow()



def main():
    try:
        app=QApplication(sys.argv)
        app.setQuitOnLastWindowClosed(False)
        app.setApplicationName("HELIX")
        app.setWindowIcon(make_icon())
        win=HelixLauncher(); win.show()
        sys.exit(app.exec())
    except Exception:
        msg=traceback.format_exc()
        try: QMessageBox.critical(None,"HELIX Fatal",msg)
        except Exception: print(msg)
        sys.exit(1)

if __name__=="__main__":
    main()
