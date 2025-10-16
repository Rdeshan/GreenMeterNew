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


// Parse a natural language description and create a device for the authenticated user
export const addDeviceFromDescription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { description } = req.body as { description?: string };
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'description is required' });
    }

    // Very simple heuristic parser. Example inputs:
    // "Add kitchen fan 60W", "a living room LED light with 12 watts", "AC in bedroom 900W"
    const lower = description.toLowerCase();

    // Extract consumption (watts)
    let consumption: number | undefined;
    const wattMatch = lower.match(/(\d{1,5})\s*(w|watt|watts)\b/);
    if (wattMatch) {
      consumption = Number(wattMatch[1]);
    }

    // Extract location (common words)
    const locations = ['kitchen','bedroom','living room','hall','garage','bathroom','garage','room','office','dining'];
    let location: string | undefined = locations.find((loc) => lower.includes(loc));
    if (!location) {
      // single-word fallbacks
      const singleLocs = ['kitchen','bedroom','hall','garage','bathroom','office','dining','living'];
      location = singleLocs.find((loc) => lower.includes(loc));
    }
    if (location === 'living') location = 'living room';

    // Extract type/name keywords
    let type: string | undefined;
    let device_name: string | undefined;
    const keywordMap: Array<{ k: RegExp; name: string; type?: string }> = [
      { k: /\bfan\b/, name: 'Fan', type: 'Electric' },
      { k: /\bac\b|air\s*conditioner/, name: 'Air Conditioner', type: 'Electric' },
      { k: /\b(light|bulb|led)\b/, name: 'Light', type: 'Electric' },
      { k: /\bheater\b/, name: 'Heater', type: 'Electric' },
      { k: /\bfridge|refrigerator\b/, name: 'Refrigerator', type: 'Electric' },
      { k: /\bwasher|washing\s*machine\b/, name: 'Washing Machine', type: 'Electric' },
    ];
    for (const item of keywordMap) {
      if (item.k.test(lower)) {
        device_name = item.name;
        type = item.type || type;
        break;
      }
    }

    // If we still don't have a device_name, fall back to first 3 words
    if (!device_name) {
      device_name = description.trim().split(/\s+/).slice(0, 3).join(' ');
    }

    const device = await Device.create({
      userId,
      device_name,
      type: type || 'Electric',
      location,
      consumption,
    });

    return res.status(201).json({ data: device });
  } catch (err) {
    console.error('addDeviceFromDescription error', err);
    return res.status(500).json({ error: 'Failed to create device from description' });
  }
}

export default{
 saveDevice,
 getAllDevices,
 getOneDevice,
 deleteDevice,
upDateDevice,
 updateDevicePartially,
 addDeviceFromDescription,

}

