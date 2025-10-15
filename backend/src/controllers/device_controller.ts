import { Request, Response } from 'express';
import Device from '../models/Device';
import mongoose from 'mongoose';
import Consumption from '../models/consumption.model';

export const saveDevice = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const device = new Device({
      ...req.body,
      userId,
    });
    await device.save();
    res.status(201).json(device);
  } catch (error) {
    res.status(400).json({ error: 'Failed to save device' });
  }
};
export const getAllDevices = async (req:Request,res:Response) =>{
    try{
        const userId = (req as any).userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const devices =  await Device.find({ userId });
        res.status(200).json({devices});
    }catch(err){
        console.error(err);
        res.status(400).json({ error: "cannot get all devices" });
    }
}
export const getOneDevice = async (req: Request, res: Response) => {
  try {
    let { deviceId } = req.params;
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(deviceId)) {
      console.log("Invalid device ID");
      return res.status(400).json({ error: "Invalid device ID" });
    }

    const oneDevice = await Device.findOne({ _id: deviceId, userId });
    console.log("oneDevice from DB:", oneDevice);

    if (!oneDevice) {
      console.log("Device not found");
      return res.status(404).json({ error: "Device not found" });
    }

    res.status(200).json({ data: oneDevice });
  } catch (err) {
    console.error("Error in getOneDevice:", err);
    res.status(500).json({ error: "Cannot get the single device" });
  }
};


export const deleteDevice = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.deviceId;
    console.log("Received deviceId raw:", JSON.stringify(rawId));
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!rawId) {
      return res.status(400).json({ error: "deviceId param is required" });
    }

    const deviceId = String(rawId).trim();
    console.log("Trimmed deviceId:", deviceId);

    if (!mongoose.Types.ObjectId.isValid(deviceId)) {
      console.log("Invalid device ID format");
      return res.status(400).json({ error: "Invalid device ID" });
    }

    // Use findOneAndDelete to be explicit
    const deletedDevice = await Device.findOneAndDelete({ _id: deviceId, userId }).lean();
    console.log("Deleted device result:", deletedDevice);

     await Consumption.deleteMany({ device: deviceId })
    console.log("Deleted related consupmtions:");

    if (!deletedDevice) {
      console.log("Device not found for deletion");
      return res.status(404).json({ error: "Device not found" });
    }

    console.log("✅ Device deleted successfully");
    return res.status(200).json({ data: deletedDevice });
  } catch (err) {
    console.error("Error deleting device:", err);
    return res.status(500).json({ error: "Cannot delete device" });
  }
};

export const upDateDevice = async(req:Request,res:Response)=>{
    try{
        const{deviceId} = req.params;
        const updates = req.body;
        const userId = (req as any).userId;
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const updateDevice = await Device.findOneAndUpdate(
            { _id: deviceId, userId },
            updates,
            {new:true,runValidators:true}
        )
        if (!updateDevice){
            return res.status(404).json({error:"Device not found"})
        }
        res.status(200).json({message:"Device update successfully",updateDevice})

    }catch(err){    
        console.log(err);
        res.status(400).json({error:"error in device updating"})

    }
}


export const updateDevicePartially = async(req:Request,res:Response)=>{
    try{
        const{deviceId} = req.params;
        const{state} = req.body;
        const userId = (req as any).userId;
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

             if (!["ON", "OFF"].includes(state)) {
            return res.status(400).json({ error: "State must be ON or OFF" });
        }

        const updatedDevice = await Device.findOneAndUpdate(
            { _id: deviceId, userId },
            { state },                  
            { new: true, runValidators: true }
        );

        if (!updatedDevice) {
            return res.status(404).json({ error: "Device not found" });
        }

        res.status(200).json({messgae:`device is ${state}`,updatedDevice});
        
    }catch(err){
        console.log(err);
        res.status(404).json({error:"cannot update device partially"});

    }
}


export default{
 saveDevice,
 getAllDevices,
 getOneDevice,
 deleteDevice,
upDateDevice,
 updateDevicePartially,

}

