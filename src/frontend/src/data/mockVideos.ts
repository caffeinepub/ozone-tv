import type { Video } from "../backend";

export const MOCK_VIDEOS: Video[] = [
  {
    id: "mock-1",
    title: "Echoes of the Forgotten City",
    description:
      "A lone detective uncovers a conspiracy buried beneath a sprawling metropolis. A gripping neo-noir thriller set in a rain-soaked future.",
    category: "Movies",
    thumbnailUrl: "https://picsum.photos/seed/city1/640/360",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isPremium: true,
    uploadedAt: BigInt(Date.now() - 86400000 * 2),
    views: BigInt(142500),
  },
  {
    id: "mock-2",
    title: "The Last Gardener",
    description:
      "In a post-apocalyptic world, the last botanist fights to restore life to barren lands. A poetic short film about hope and resilience.",
    category: "Short Films",
    thumbnailUrl: "https://picsum.photos/seed/garden1/640/360",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isPremium: false,
    uploadedAt: BigInt(Date.now() - 86400000 * 5),
    views: BigInt(38200),
  },
  {
    id: "mock-3",
    title: "Neon Pulse",
    description:
      "An electrifying music video experience featuring cutting-edge visual effects and pulsating beats from chart-topping artists.",
    category: "Music Videos",
    thumbnailUrl: "https://picsum.photos/seed/neon1/640/360",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isPremium: false,
    uploadedAt: BigInt(Date.now() - 86400000 * 1),
    views: BigInt(89700),
  },
  {
    id: "mock-4",
    title: "Captain Stardust and the Space Pirates",
    description:
      "Join Captain Stardust on an intergalactic adventure to save the Space Zoo from the notorious Space Pirates!",
    category: "Children",
    thumbnailUrl: "https://picsum.photos/seed/space1/640/360",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isPremium: false,
    uploadedAt: BigInt(Date.now() - 86400000 * 3),
    views: BigInt(215000),
  },
  {
    id: "mock-5",
    title: "Fractures",
    description:
      "A family's secrets unravel over a single weekend. A powerful drama that explores the fragility of truth and love.",
    category: "Movies",
    thumbnailUrl: "https://picsum.photos/seed/fract1/640/360",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isPremium: true,
    uploadedAt: BigInt(Date.now() - 86400000 * 7),
    views: BigInt(67300),
  },
  {
    id: "mock-6",
    title: "Mirror",
    description:
      "A seven-minute visual poem about identity and reflection. Shot entirely in reverse with an original score.",
    category: "Short Films",
    thumbnailUrl: "https://picsum.photos/seed/mirror1/640/360",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isPremium: false,
    uploadedAt: BigInt(Date.now() - 86400000 * 4),
    views: BigInt(22100),
  },
  {
    id: "mock-7",
    title: "Velvet Underground Sessions",
    description:
      "Exclusive live studio sessions from underground artists. Raw, real, and unfiltered music experiences.",
    category: "Music Videos",
    thumbnailUrl: "https://picsum.photos/seed/velvet1/640/360",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isPremium: true,
    uploadedAt: BigInt(Date.now() - 86400000 * 6),
    views: BigInt(54800),
  },
  {
    id: "mock-8",
    title: "Luna and the Rainbow Forest",
    description:
      "Luna the brave little fox goes on a magical journey through the Rainbow Forest to find her missing friend.",
    category: "Children",
    thumbnailUrl: "https://picsum.photos/seed/luna1/640/360",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isPremium: false,
    uploadedAt: BigInt(Date.now() - 86400000 * 2),
    views: BigInt(178000),
  },
];
