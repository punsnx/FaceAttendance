import cv2
import numpy as np
import face_recognition
import os
from datetime import datetime

path = 'imgpool'
images = []
classNames = []
myList = os.listdir(path)

cap = cv2.VideoCapture(0)

while True:
    capped, img = cap.read()
    imgmod = cv2.resize(img, (0, 0), None, 0.25, 0.25)
    imgmod = cv2.cvtColor(imgmod, cv2.COLOR_BGR2RGB)
    
    facesCurFrameLoc = face_recognition.face_locations(imgmod)
    encodesCurFrame = face_recognition.face_encodings(imgmod, facesCurFrameLoc)