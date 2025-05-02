document.getElementById("vipForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const discordName = document.getElementById("discordName").value.trim();
  const imageFile = document.getElementById("image").files[0];
  const preview = document.getElementById("preview");

  // ตรวจสอบเบื้องต้น
  if (!discordName || !imageFile) {
    alert("กรุณากรอกชื่อ Discord และเลือกรูปสลิป");
    return;
  }

  // ตรวจขนาด/ประเภทไฟล์
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(imageFile.type)) {
    alert("กรุณาอัปโหลดรูป JPG, PNG หรือ WEBP เท่านั้น");
    return;
  }

  if (imageFile.size > 5 * 1024 * 1024) {
    alert("ขนาดรูปต้องไม่เกิน 5MB");
    return;
  }

  // แสดงสถานะ
  preview.innerHTML = "📤 กำลังตรวจสอบสลิป...";

  // แปลงไฟล์รูปภาพเป็น Base64
  const reader = new FileReader();
  reader.onloadend = async function () {
    const base64Image = reader.result.split(',')[1]; // เอาแค่ส่วนของ Base64 ไม่เอาพวก data:image/jpeg;base64, ออก
    // เตรียมส่งข้อมูลไปยังเซิร์ฟเวอร์
    const formData = {
      discordName: discordName,
      image: base64Image // ส่ง Base64 ไปแทนไฟล์
    };

    try {
      const res = await fetch("https://dxbbpi.github.io/vipalex2/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ใช้ JSON แทน FormData
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // หากสลิปได้รับการตรวจสอบสำเร็จ
        preview.innerHTML = `สลิปได้ถูกตรวจสอบแล้ว: ${result.message}`;
      } else {
        // หากสลิปผิด
        preview.innerHTML = `สลิปผิด: ${result.message || 'กรุณาใส่รูปภาพที่ถูกต้อง'}`;
      }
    } catch (error) {
      preview.innerHTML = "เกิดข้อผิดพลาดในการส่งข้อมูล โปรดลองใหม่อีกครั้ง";
      console.error("Error during submission:", error);
    }
  };

  // อ่านไฟล์เป็น Base64
  reader.readAsDataURL(imageFile);
});
