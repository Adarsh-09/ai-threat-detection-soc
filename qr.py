import qrcode
import socket

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

local_ip = get_ip()
url = f"http://{local_ip}:5173/"
qr = qrcode.make(url)
qr.save("dashboard_qr.png")

print(f"✅ QR Code generated for: {url}")
print("📱 Scan 'dashboard_qr.png' with your phone to view the SOC dashboard!")