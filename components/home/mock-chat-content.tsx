interface ChatMessage {
  type: 'user' | 'ai';
  message: string;
}

export interface AgentChat {
  agentName: string;
  agentSpecialty: string;
  conversation: ChatMessage[];
}

const agentChats: AgentChat[] = [
  {
    agentName: "Code Assist",
    agentSpecialty: "Programming",
    conversation: [
      {
        type: 'user',
        message: 'I need help optimizing my React components'
      },
      {
        type: 'ai',
        message: 'I can help with that! Are you having issues with re-renders or looking to implement memoization?'
      },
      {
        type: 'user',
        message: 'My components are re-rendering too often'
      }
    ]
  },
  {
    agentName: "Design Pro",
    agentSpecialty: "UI/UX Design",
    conversation: [
      {
        type: 'user',
        message: 'How can I improve my website\'s accessibility?'
      },
      {
        type: 'ai',
        message: 'Let\'s start with an audit of your current ARIA labels and color contrast ratios.'
      },
      {
        type: 'user',
        message: 'That would be great! Where should we begin?'
      }
    ]
  },
  {
    agentName: "Data Wizard",
    agentSpecialty: "Data Analysis",
    conversation: [
      {
        type: 'user',
        message: 'Can you help me analyze my customer retention data?'
      },
      {
        type: 'ai',
        message: 'Of course! First, let\'s look at your cohort analysis and churn rates.'
      },
      {
        type: 'user',
        message: 'I\'m particularly interested in the 30-day retention'
      }
    ]
  },
  {
    agentName: "Security Guard",
    agentSpecialty: "Cybersecurity",
    conversation: [
      {
        type: 'user',
        message: 'How can I secure my API endpoints better?'
      },
      {
        type: 'ai',
        message: 'Let\'s implement JWT authentication and rate limiting for your endpoints.'
      },
      {
        type: 'user',
        message: 'Can you explain how JWT authentication works?'
      }
    ]
  },
  {
    agentName: "Marketing Pro",
    agentSpecialty: "Digital Marketing",
    conversation: [
      {
        type: 'user',
        message: 'Need help with my content marketing strategy'
      },
      {
        type: 'ai',
        message: 'I\'ll help you create a content calendar based on your target audience and SEO goals.'
      },
      {
        type: 'user',
        message: 'What metrics should I focus on?'
      }
    ]
  },
  {
    agentName: "Culinary Chef",
    agentSpecialty: "Molecular Gastronomy",
    conversation: [
      {
        type: 'user',
        message: 'How can I create a spherical mango ravioli?'
      },
      {
        type: 'ai',
        message: 'Let\'s use sodium alginate spherification! First, we\'ll make a mango fluid gel...'
      },
      {
        type: 'user',
        message: 'What about the texture contrast?'
      }
    ]
  },
  {
    agentName: "Neuro Athlete",
    agentSpecialty: "Sports Psychology",
    conversation: [
      {
        type: 'user',
        message: 'I choke during penalty kicks'
      },
      {
        type: 'ai',
        message: 'Let\'s implement a pre-shot routine: 3 breaths, visualize the net, trust your muscle memory...'
      },
      {
        type: 'user',
        message: 'What if the crowd is loud?'
      }
    ]
  },
  {
    agentName: "Eco Architect",
    agentSpecialty: "Sustainable Design",
    conversation: [
      {
        type: 'user',
        message: 'How to cool a house without AC?'
      },
      {
        type: 'ai',
        message: 'Trombe walls for thermal mass, green roof insulation, and strategic cross-ventilation...'
      },
      {
        type: 'user',
        message: 'What materials are best?'
      }
    ]
  },
  {
    agentName: "Vintage Curator",
    agentSpecialty: "Retro Fashion",
    conversation: [
      {
        type: 'user',
        message: 'Need 70s disco outfit ideas'
      },
      {
        type: 'ai',
        message: 'Platform boots, wide-leg jumpsuits! Let\'s source vintage polyester with metallic thread...'
      },
      {
        type: 'user',
        message: 'How to authenticate 70s Levi\'s?'
      }
    ]
  },
  {
    agentName: "Quantum Tutor",
    agentSpecialty: "Quantum Computing",
    conversation: [
      {
        type: 'user',
        message: 'Explain superposition simply'
      },
      {
        type: 'ai',
        message: 'Imagine a quantum cat simultaneously practicing and ignoring yoga - until you observe it!'
      },
      {
        type: 'user',
        message: 'How does this affect encryption?'
      }
    ]
  },
  {
    agentName: "Drone Cinematographer",
    agentSpecialty: "Aerial Videography",
    conversation: [
      {
        type: 'user',
        message: 'Best settings for mountain tracking shots?'
      },
      {
        type: 'ai',
        message: 'Use 4K/60fps, ND16 filter, and try the spiral上升模式 with 75% speed ramping...'
      },
      {
        type: 'user',
        message: 'Wind compensation tips?'
      }
    ]
  },
  {
    agentName: "Paleo Detective",
    agentSpecialty: "Ancient Ecosystems",
    conversation: [
      {
        type: 'user',
        message: 'How did T-Rex regulate body temp?'
      },
      {
        type: 'ai',
        message: 'Recent studies suggest nasal turbinates acted as heat exchangers! Let\'s analyze fossilized...'
      },
      {
        type: 'user',
        message: 'Compare to modern reptiles?'
      }
    ]
  },
  {
    agentName: "Synth Maestro",
    agentSpecialty: "Vintage Synthesizers",
    conversation: [
      {
        type: 'user',
        message: 'Recreate 80s Yamaha DX7 bass'
      },
      {
        type: 'ai',
        message: 'Stack operators 3+5 with ratio 3.00, feedback 27... add chorus and tape saturation!'
      },
      {
        type: 'user',
        message: 'FM vs subtractive for pads?'
      }
    ]
  },
  {
    agentName: "Urban Forager",
    agentSpecialty: "Wild Edibles",
    conversation: [
      {
        type: 'user',
        message: 'Safe mushrooms in Central Park?'
      },
      {
        type: 'ai',
        message: 'Chicken of the woods on oaks! But remember the 3-step ID: spore print, gills, habitat...'
      },
      {
        type: 'user',
        message: 'Poison lookalikes?'
      }
    ]
  },
  {
    agentName: "AI Illusionist",
    agentSpecialty: "Magic Tricks",
    conversation: [
      {
        type: 'user',
        message: 'Teach a coin vanish'
      },
      {
        type: 'ai',
        message: 'French Drop technique: retention through finger mechanics and audience misdirection...'
      },
      {
        type: 'user',
        message: 'How to practice timing?'
      }
    ]
  },
  {
    agentName: "VFX Alchemist",
    agentSpecialty: "Practical Effects",
    conversation: [
      {
        type: 'user',
        message: 'Create realistic rain without CGI'
      },
      {
        type: 'ai',
        message: 'Mix milk with water for visibility, use rain bars 45° from camera, backlight with...'
      }
    ]
  },
  {
    agentName: "Genealogist",
    agentSpecialty: "Family History",
    conversation: [
      {
        type: 'user',
        message: 'Trace Irish ancestors pre-1900'
      },
      {
        type: 'ai',
        message: 'Check church records in County Kerry! Many were microfilmed by Mormons in...'
      }
    ]
  },
  {
    agentName: "Toxicologist",
    agentSpecialty: "Poisons",
    conversation: [
      {
        type: 'user',
        message: 'Identify unknown berries'
      },
      {
        type: 'ai',
        message: 'Describe stem attachment: umbel=危险, raceme=可能安全. Any milky sap?'
      }
    ]
  },
  {
    agentName: "K-pop Producer",
    agentSpecialty: "K-pop Music",
    conversation: [
      {
        type: 'user',
        message: 'Create addictive hook'
      },
      {
        type: 'ai',
        message: 'Pentatonic melody over EDM beat with \'청량感\' (refreshing) synth stabs and...'
      }
    ]
  },
  {
    agentName: "Legal Eagle",
    agentSpecialty: "Copyright Law",
    conversation: [
      {
        type: 'user',
        message: 'Fair use for meme pages?'
      },
      {
        type: 'ai',
        message: 'Depends on transformative nature - parody vs mere reproduction. Let\'s analyze...'
      }
    ]
  }
];

export function getRandomChat(): AgentChat {
  const randomIndex = Math.floor(Math.random() * agentChats.length);
  return agentChats[randomIndex];
}

export const mockChatMessages = agentChats[0].conversation; // Keeping this for backward compatibility 