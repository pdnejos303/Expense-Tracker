// ไฟล์ Profile.js แสดงข้อมูลโปรไฟล์ผู้ใช้ แก้ไขชื่อ อัปโหลดรูปโปรไฟล์ และออกจากระบบได้
// This Profile.js file displays user profile information, allows editing display name and uploading a profile picture, and signing out.

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Avatar,
  Grid,
  Box,
  Container,
  TextField,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { auth, firestore, storage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function Profile() {
  // เก็บข้อมูลผู้ใช้, สถานะแก้ไข, ชื่อที่จะเปลี่ยน, สถานะ snackbar และสถานะการอัปโหลดรูป
  // Store user data, editing state, displayName state, snackbar state, and uploading state
  const [userData, setUserData] = useState({});
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setDisplayName(user.displayName);
      firestore
        .collection('users')
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            setUserData(doc.data());
          }
        });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login');
    });
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      // อัปเดตโปรไฟล์ผู้ใช้ด้วยชื่อที่แก้ไข
      // Update user profile display name
      await user.updateProfile({
        displayName: displayName,
      });
      setEditing(false);
      setOpenSnackbar(true);
    }
  };

  const handlePhotoUpload = async (event) => {
    // อัปโหลดภาพโปรไฟล์ของผู้ใช้ไปยัง Firebase Storage
    // Upload user profile photo to Firebase Storage
    const user = auth.currentUser;
    const file = event.target.files[0];
    if (user && file) {
      setUploading(true);
      const storageRef = storage.ref();
      const userPhotoRef = storageRef.child(`user_photos/${user.uid}/${file.name}`);
      await userPhotoRef.put(file);
      const photoURL = await userPhotoRef.getDownloadURL();
      await user.updateProfile({ photoURL });
      setUploading(false);
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ paddingTop: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          โปรไฟล์ของฉัน
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Avatar
              src={auth.currentUser.photoURL}
              alt={auth.currentUser.displayName}
              sx={{ width: 150, height: 150, margin: '0 auto' }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-photo"
              type="file"
              onChange={handlePhotoUpload}
            />
            <label htmlFor="upload-photo">
              <IconButton color="primary" component="span" sx={{ mt: 1 }}>
                <PhotoCamera />
              </IconButton>
            </label>
            {uploading && <Typography>กำลังอัปโหลด...</Typography>}
          </Grid>
          <Grid item xs={12} sm={8}>
            {editing ? (
              <TextField
                label="ชื่อ"
                fullWidth
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            ) : (
              <Typography variant="h6">
                ชื่อ: {auth.currentUser.displayName}
              </Typography>
            )}
            <Typography variant="h6">
              อีเมล: {auth.currentUser.email}
            </Typography>
            <Typography variant="h6">
              วันที่สมัครสมาชิก:{' '}
              {userData.createdAt
                ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString()
                : new Date(auth.currentUser.metadata.creationTime).toLocaleDateString()}
            </Typography>
            {editing ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                sx={{ mt: 2, mr: 2 }}
              >
                บันทึก
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleEdit}
                sx={{ mt: 2, mr: 2 }}
              >
                แก้ไขข้อมูล
              </Button>
            )}
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              sx={{ mt: 2 }}
            >
              ออกจากระบบ
            </Button>
          </Grid>
        </Grid>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity="success"
            sx={{ width: '100%' }}
          >
            บันทึกข้อมูลเรียบร้อยแล้ว!
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default Profile;
