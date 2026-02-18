-- Clear existing dummy data
DELETE FROM public.winner_projects;
DELETE FROM public.event_winners;
DELETE FROM public.events WHERE is_completed = true;

-- Use DO block for safe UUID generation and insertion
DO $$
DECLARE
    e1_id UUID := gen_random_uuid();
    e2_id UUID := gen_random_uuid();
    e3_id UUID := gen_random_uuid();
    e4_id UUID := gen_random_uuid();
    w1_id UUID := gen_random_uuid();
    w2_id UUID := gen_random_uuid();
    w3_id UUID := gen_random_uuid();
    w4_id UUID := gen_random_uuid();
    w5_id UUID := gen_random_uuid();
BEGIN
    -- Insert Events
    INSERT INTO public.events (id, title, category, date, location, mode, is_completed, is_verified, college, description, image_url, source_name)
    VALUES 
    (e1_id, 'Smart India Hackathon (SIH) 2024', 'Technology', '2024-12-15', 'New Delhi, India', 'offline', true, true, 'Ministry of Education', 'World''s biggest open innovation model which provides students a platform to solve some of the pressing problems we face in our daily lives.', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop', 'SIH Official'),
    (e2_id, 'IndiaAI Impact Gen-AI Hackathon 2025', 'AI', '2025-01-20', 'IISc Bangalore', 'hybrid', true, true, 'IISc & IndiaAI', 'Hackathon dedicated to developing innovative generative AI solutions specifically designed for the Indian context.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop', 'IISc CNI'),
    (e3_id, 'Google Solution Challenge 2024', 'Technology', '2024-05-22', 'Global', 'online', true, true, 'Google for Developers', 'The Solution Challenge is an annual contest that invites students to develop solutions for local community problems using one or more Google products.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop', 'Google Developers'),
    (e4_id, 'Imagine Cup 2024', 'Innovation', '2024-05-14', 'Seattle, USA', 'offline', true, true, 'Microsoft', 'The Microsoft Imagine Cup is a global competition that empowers the next generation of computer science students to team up and use their creativity.', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop', 'Microsoft');

    -- Insert Winners for SIH 2024
    INSERT INTO public.event_winners (id, event_id, winner_name, college_name, team_name, position)
    VALUES 
    (w1_id, e1_id, 'Aryan Sharma', 'Heritage Institute of Technology', 'The Web Knights', 1),
    (w2_id, e1_id, 'Sneha Gupta', 'Vardhaman College of Engineering', 'InnoCoders', 2);

    -- Insert Projects for SIH 2024
    INSERT INTO public.winner_projects (id, winner_id, project_title, problem_statement, solution_summary, technologies, impact, demo_link, repo_link)
    VALUES 
    (gen_random_uuid(), w1_id, 'Smart Traffic Management AI', 'Traffic congestion in urban areas causing 30% increase in commute time.', 'AI-powered traffic signal control using real-time camera feeds and density estimation.', ARRAY['Python', 'OpenCV', 'PyTorch', 'FastAPI'], 'Reduced peak-hour congestion by 25% in trial city blocks.', 'https://github.com/topics/traffic-management', 'https://github.com/topics/smart-city'),
    (gen_random_uuid(), w2_id, 'DeepScan: Forensic Tool', 'Difficulty in identifying altered digital documents in legal forensics.', 'A tool that uses neural networks to detect micro-manipulations in PDFs and images.', ARRAY['TensorFlow', 'Python', 'Flask', 'React'], 'Used by 3 local forensic labs for preliminary verification.', 'https://github.com/topics/digital-forensics', 'https://github.com/topics/image-analysis');

    -- Insert Winners for IndiaAI 2025
    INSERT INTO public.event_winners (id, event_id, winner_name, college_name, team_name, position)
    VALUES 
    (w3_id, e2_id, 'Rahul Verma', 'IISc Bangalore', 'NeuralNodes', 1),
    (w4_id, e2_id, 'Priya Rao', 'IIT Madras', 'NLP-Gen', 2);

    -- Insert Projects for IndiaAI 2025
    INSERT INTO public.winner_projects (id, winner_id, project_title, problem_statement, solution_summary, technologies, impact, demo_link, repo_link)
    VALUES 
    (gen_random_uuid(), w3_id, 'Krishi-GPT', 'Lack of expert agricultural advice in local Indian languages.', 'A multilingual LLM agent that provides crop advice in 12 Indian languages.', ARRAY['LangChain', 'Llama-3', 'Python', 'Streamlit'], 'Reached 5000+ farmers in first month of beta release.', 'https://cni.iisc.ac.in/hackathons/gen-AI-2025-results/', 'https://github.com/topics/generative-ai'),
    (gen_random_uuid(), w4_id, 'LegalMind AI', 'High cost and slow speed of legal document review for startups.', 'LLM-powered tool for automated legal compliance and contract drafting.', ARRAY['OpenAI', 'Next.js', 'PostgreSQL', 'Python'], 'Decreased review time from 3 days to 15 minutes for simple NDAs.', 'https://github.com/topics/legaltech', 'https://github.com/topics/llm-agents');

    -- Insert Winner for Google Solution Challenge 2024
    INSERT INTO public.event_winners (id, event_id, winner_name, college_name, team_name, position)
    VALUES 
    (w5_id, e3_id, 'Wonder Women Team', 'University of Mauritius', 'Team Wonder', 1);

    -- Insert Project for Google Solution Challenge 2024
    INSERT INTO public.winner_projects (id, winner_id, project_title, problem_statement, solution_summary, technologies, impact, demo_link, repo_link)
    VALUES 
    (gen_random_uuid(), w5_id, 'SafeCycle', 'High rate of accidents involving cyclists due to poor road lighting.', 'Smart cycling gear with automated signaling and obstacle detection.', ARRAY['Flutter', 'Firebase', 'TensorFlow Lite', 'Arduino'], 'Winner of 2024 Solution Challenge Global Top 3.', 'https://developers.google.com/community/gdsc-solution-challenge/winners', 'https://github.com/topics/google-solution-challenge');
END $$;
