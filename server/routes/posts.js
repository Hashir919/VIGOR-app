
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// GET all posts
router.get('/', async (req, res) => {
    try {
        let posts = await Post.find().sort({ createdAt: -1 });

        // Seed if empty
        if (posts.length === 0) {
            const seedPosts = [
                {
                    userId: 'user_2',
                    userName: 'Sarah Jenkins',
                    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD73o3qo5W5c-96eUxfJ21cYMjcjQCrEkZQOKnCKeQdEZOnJfdmADGGOM4N4EbXQs0tmh-XX3YZ1qr_PdhBbILu6Tw6W3VEgoa2Jc4jfFXUKONT7OqQuC9UUPF7f4I14fdG6FdIFdeEj_vWpOYMp78tDn1m3ARKeHY8q-LOZ_02imDRTbu6zuRacmdWQCQrcneocNr5n3hh4M9MoMmQygIzm1BWL172VhRMfIrG3ax_C2rZug5kar-FmXeeXytzOEjKJoho2gzTufYM',
                    content: 'finished a 10k!',
                    type: 'activity',
                    createdAt: new Date(Date.now() - 24 * 60000), // 24m ago
                    likes: 12,
                    comments: 3,
                    metadata: {
                        distance: '10.0',
                        duration: '52:14',
                        pace: '5\'13"/km',
                        bpm: 164
                    }
                },
                {
                    userId: 'user_3',
                    userName: 'Mike Ross',
                    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo6Xf7S6sR5JQMt0avEb5K-zb7Cw-lDTN0cwmN-z3iFOFrRfm0FaNtnFxE9fRi0DL0Veeq9ekNLBYYvtWiq9yuV4H4lwl0cOaUWsFVlfop_aGQFTT4_3wK-QJ9XEqAr8wWL8tGlmZYCbOjn2xUIGe7WTdDFOmul_1hC3-8RbgIX2eUFulhQ4_Vkvrl3uonIfDLUS3GNYN27B-tOVZctJI-UfwDCV--MHglIQE_y9PgIBhAXEZgLKywnDKG7w2EH27Pwngmr1Wg_AoB',
                    content: 'hit his step goal!',
                    type: 'activity',
                    createdAt: new Date(Date.now() - 60 * 60000), // 1h ago
                    likes: 24,
                    comments: 8,
                    metadata: {
                        steps: 12540
                    }
                },
                {
                    userId: 'user_4',
                    userName: 'Emma Watson',
                    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK9XYGY08meMAaXpQ4Up1UoOGnwg4mBVw_Hk9M3lkG-1b8XAwNM9TL6-QBD9btU0XjqCpCbzjPxHNaCknylz9TuDy5lwT7F5B5KSUvtiYdstKa5uwlrjkOFXt42mWqMuM-zrM2got4WVGxRfLG-83rrBaRD48kvjchNVWhV7Qif2jvsO3OhSUgoPtBklEDMzdkP1dUwhH96DQyz6_fOZAfJfmc-WT7dGbs3dxo1zEcSyPTy1eZwr0L9Lcwo-T9dFQnxcy7vaSCvRiM',
                    content: 'earned a new badge!',
                    type: 'achievement',
                    createdAt: new Date(Date.now() - 180 * 60000), // 3h ago
                    likes: 42,
                    comments: 1,
                    metadata: {
                        badge: 'Early Bird'
                    }
                }
            ];
            await Post.insertMany(seedPosts);
            posts = await Post.find().sort({ createdAt: -1 });
        }
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
