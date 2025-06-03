const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');

const add = async (req, res) => {
    try {
        const { agenda, attendes, attendesLead, location, related, dateTime, notes } = req.body;

        // Create new meeting
        const meeting = new MeetingHistory({
            agenda,
            attendes,
            attendesLead,
            location,
            related,
            dateTime,
            notes,
            createBy: req.user.userId
        });

        await meeting.save();
        res.status(200).json({ message: 'Meeting created successfully', meeting });
    } catch (error) {
        console.error('Failed to create Meeting:', error);
        res.status(400).json({ error: 'Failed to create Meeting' });
    }
}

const index = async (req, res) => {
    try {
        const query = { ...req.query, deleted: false };

        let meetings = await MeetingHistory.find(query)
            .populate({
                path: 'createBy',
                select: 'firstName lastName username'
            })
            .sort({ timestamp: -1 });

        // Add createdByName for frontend compatibility
        meetings = meetings.map(meeting => ({
            ...meeting.toObject(),
            createdByName: meeting.createBy ? `${meeting.createBy.firstName} ${meeting.createBy.lastName}` : 'Unknown'
        }));

        res.status(200).json(meetings);
    } catch (error) {
        console.error('Failed to fetch Meetings:', error);
        res.status(400).json({ error: 'Failed to fetch Meetings' });
    }
}

const view = async (req, res) => {
    try {
        let meeting = await MeetingHistory.findOne({ _id: req.params.id, deleted: false })
            .populate({
                path: 'createBy',
                select: 'firstName lastName username'
            });

        if (!meeting) return res.status(404).json({ message: "Meeting not found." });

        res.status(200).json(meeting);
    } catch (error) {
        console.error('Failed to fetch Meeting:', error);
        res.status(400).json({ error: 'Failed to fetch Meeting' });
    }
}

const edit = async (req, res) => {
    try {
        const { agenda, attendes, attendesLead, location, related, dateTime, notes } = req.body;

        let result = await MeetingHistory.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    agenda,
                    attendes,
                    attendesLead,
                    location,
                    related,
                    dateTime,
                    notes
                }
            }
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('Failed to update Meeting:', error);
        res.status(400).json({ error: 'Failed to update Meeting' });
    }
}

const deleteData = async (req, res) => {
    try {
        const meetingId = req.params.id;

        const meeting = await MeetingHistory.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({ success: false, message: 'Meeting not found' });
        }

        // Soft delete
        await MeetingHistory.updateOne({ _id: meetingId }, { $set: { deleted: true } });
        res.status(200).json({ message: 'Meeting deleted successfully' });
    } catch (error) {
        console.error('Failed to delete Meeting:', error);
        res.status(400).json({ error: 'Failed to delete Meeting' });
    }
}

const deleteMany = async (req, res) => {
    try {
        const meetingIds = req.body; // Array of meeting IDs

        if (!Array.isArray(meetingIds) || meetingIds.length === 0) {
            return res.status(400).json({ message: "No meeting IDs provided" });
        }

        const result = await MeetingHistory.updateMany(
            { _id: { $in: meetingIds } },
            { $set: { deleted: true } }
        );

        res.status(200).json({
            message: "Meetings deleted successfully",
            deletedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Failed to delete Meetings:', error);
        res.status(400).json({ error: 'Failed to delete Meetings' });
    }
}

module.exports = { add, index, view, edit, deleteData, deleteMany }