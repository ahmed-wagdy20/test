import mongoose from "mongoose";

const create = async ({ model, docs = {}, options = { validateBeforeSave: true } }) => {
    return model.create([docs], { options })
};

const findOne = async ({ model, condition = {} }) => {
    return model.findOne(condition)
};

const findById = async ({ model, _id }) => {
    return model.findById(_id)
};

const findOneAndUpdate = async ({ model, condition, updatedDocs = {}, options = { runValidators: true, new: true } }) => {
    return await model.findOneAndUpdate(condition, updatedDocs, options)
};

const findOneAndDelete = async ({ model, condition, options = {} }) => {
    return await model.findOneAndDelete(condition, options)
};

const updateOne = async ({ model, filter, updateDocs, options = { runValidator: true, new: true } }) => {
    return await model.updateOne(filter, updateDocs, options)
};

const find = async ({ model, filter = {}, populate = [] }) => {
    return await model.find(filter).populate(populate)
}

export {
    create,
    findOne,
    findById,
    findOneAndUpdate,
    findOneAndDelete,
    updateOne,
    find
}
