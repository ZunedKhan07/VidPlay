import mongoose, {Schema} from "mongoose";
import { User } from "./user.models";
import mongooseAggregatePaginate from 
"mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile:
        {
            type : String,
            required : true,
            uniqui : true
        },

        thumpNail:
        {
            type : String,
            required : true,
        },

        owner:
        {
            type : Schema.Types.ObjectId,
            ref : "User"
        },

        title:
        {
            type : String,
            required : [true, 'Title is required']
        },

        description:
        {
            type : String,
            required : true
        },

        duration:  // yeh bhi claudinary se hi nikalna hai.
        {
            type : Number,
            required : true
        },

        views:
        {
            type : Number,
            default : 0
        },

        isPublished:
        {
            type : Boolean,
            default : true
        },

    },

    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)