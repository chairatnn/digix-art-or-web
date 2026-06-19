# 1. ใช้ Node.js version 20
FROM node:20-alpine

# 2. กำหนดโฟลเดอร์ทำงาน
WORKDIR /app

# 3. คัดลอกไฟล์จัดการ package
COPY package*.json ./

# 4. ติดตั้ง dependencies
RUN npm install

# 5. คัดลอกซอร์สโค้ดทั้งหมด
COPY . .

# 6. บิลด์โปรเจกต์ให้เป็น Production (ขั้นตอนนี้สำคัญที่สุดเพื่อประหยัดแรมตอนรัน)
ENV NODE_OPTIONS=--max-old-space-size=400
RUN npm run build

# 7. เปิดพอร์ต 10000 ตามมาตรฐาน Render
EXPOSE 10000

# 8. สั่งรันในโหมด Production และบังคับพอร์ต 10000
CMD ["npm", "run", "start", "--", "-p", "10000"]