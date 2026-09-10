import mongoose, { Schema } from 'mongoose';
import { IWishlist } from '../types';

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    movieId: {
      type: Number,
      required: [true, 'Movie ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    posterPath: {
      type: String,
      default: null
    },
    backdropPath: {
      type: String,
      default: null
    },
    overview: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      default: 0
    },
    releaseDate: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Crucial: Compound unique index prevents duplicate wishlist items for a given user
WishlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);
