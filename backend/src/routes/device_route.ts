import { Router } from "express";
import {saveDevice,
    getAllDevices,
    getOneDevice,
    updateDevicePartially,
    upDateDevice,
    deleteDevice,
    addDeviceFromDescription} from "../controllers/device_controller";
import { auth } from "../middlewares/auth";

const router = Router();

router.post("/devices", auth, saveDevice);
router.post("/devices/ai", auth, addDeviceFromDescription);
router.get("/get-all-devices", auth, getAllDevices);
router.get("/get-single-device/:deviceId", auth, getOneDevice);
router.put("/update-device/:deviceId", auth, upDateDevice);
router.delete("/delete-device/:deviceId", auth, deleteDevice);
router.patch("/updatePartially/:deviceId/state", auth, updateDevicePartially);

export default router;
