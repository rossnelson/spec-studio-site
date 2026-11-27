# Areas and projects on the site

The site does not show the new areas and projects of the app. The "Areas and projects" section of the app guide has text only, and the app video has no scene about them. This change adds new stills of areas and projects to the guide, in light and dark, and a short areas and projects scene to the app video. All the footage comes from the test copy of the app on the demo spec, with invented demo data.

## Scope

### In scope
- New stills from the test copy of the app (`scripts/shots/`), on the demo spec, with invented demo repos, areas and a demo project:
  - the sidebar with colored areas;
  - a folded area with its badge;
  - the project view of a demo project with milestones and a "waits for" line.
- Each still in a light theme and a dark theme.
- One or two of these stills in the "Areas and projects" section of `src/guides/app.md`. The browser shows the light or the dark still from the system setting.
- A short scene in `video/project.mjs`: areas fold, then the project view.
- A new recording of the full app video, a contact sheet of all its frames, and a review of every frame before publish.
- The published app video in `static/video/`, and its size and caption in `src/lib/videos.ts`.
- The guide text and the scene narration in ASD-STE100 Simplified Technical English.

### Out of scope
- Changes to the app or to the relay.
- The relay video.
- Other guide sections and other video scenes, except where the new scene changes their timing.
- New SVG prototypes of the app (`src/lib/protos/`).

## Requirements

### R1 Stills of areas and projects from demo data only
The site has new stills of the sidebar with colored areas, of a folded area with its badge, and of the project view of a demo project. Each still comes from the test copy of the app with invented demo data, and shows no name or path of the user's real repos, specs, sessions or accounts.

#### R1.S1 The sidebar with colored areas
- Given the test copy of the app with the demo repos and two or more demo areas
- When a person opens the still of the sidebar
- Then the sidebar shows two or more areas, each with its color and its repos
- And the demo spec shows in its repo

#### R1.S2 A folded area with its badge
- Given a demo area with a spec that needs the user
- When a person opens the still of the folded area
- Then the area header is folded and shows a badge with the count of specs that need the user

#### R1.S3 The project view with milestones and a waits-for line
- Given an invented demo project with two or more milestones and a spec that waits for another spec
- When a person opens the still of the project view
- Then the still shows the project's progress, its milestones and its specs
- And the still shows the "waits for" line of the waiting spec

#### R1.S4 No private names in a still
- Given each new still, light and dark
- When a person checks the still
- Then no name of a real repo, spec, session or account of the user shows
- And no path in a home folder shows

#### R1.S5 A light and a dark version of each still
- Given each new still
- When a person lists the still files
- Then each still has a light version and a dark version

### R2 Stills in the "Areas and projects" section of the app guide
The "Areas and projects" section of the app guide shows one or two of the new stills. The browser shows the light still in the light scheme and the dark still in the dark scheme, with no JavaScript.

#### R2.S1 The guide section shows the stills
- Given the app guide
- When a visitor reads the "Areas and projects" section
- Then the section shows one or two stills of areas and projects
- And each still has an alternative text that says what it shows

#### R2.S2 The still follows the color scheme
- Given a still in the "Areas and projects" section
- When the visitor's system uses the dark scheme
- Then the dark version of the still shows
- And in the light scheme, the light version shows

#### R2.S3 The guide loads the stills only when needed
- Given the app guide
- When a visitor opens it
- Then each still in the "Areas and projects" section loads lazily
- And the page has no horizontal scroll at phone width

### R3 An areas and projects scene in the app video
The app video has a short scene about areas and projects: areas fold, then the project view shows. The narration is in Simplified Technical English.

#### R3.S1 The scene shows areas, then the project view
- Given the app video
- When a viewer watches the areas and projects scene
- Then the viewer sees the sidebar with colored areas, then an area that folds with its badge, then the project view
- And the narration says what an area and a project are

#### R3.S2 The scene is short
- Given the app video
- When a person measures the areas and projects scene
- Then the scene, with its title card, is 25 seconds or shorter

### R4 Every frame reviewed before publish
Before the site gets the new video, a person or Claude reviews every frame of the full recording on contact sheets.

#### R4.S1 A contact sheet of the full video
- Given the new recording of the full app video
- When the review starts
- Then contact sheets show frames from the start to the end of the video, at one frame per second or more

#### R4.S2 No bad frame goes out
- Given the contact sheets
- When the reviewer checks each frame
- Then no frame shows blank paper, a broken still, a private name or a path in a home folder
- And any bad frame is fixed and the video is recorded again before publish

### R5 The published video on the site
The site serves the new app video, and `src/lib/videos.ts` gives its true size and a caption that names areas and projects.

#### R5.S1 The site serves the new video
- Given the published files in `static/video/`
- When a visitor plays the app video on the launch page
- Then the video includes the areas and projects scene
- And the video has a poster and captions

#### R5.S2 The size and the caption are true
- Given `src/lib/videos.ts`
- When a person compares the app video's size with the file in `static/video/`
- Then the size in `videos.ts` matches the file, rounded to MB
- And the file is 40 MB or smaller
- And the caption names areas and projects

## Edge cases
- A still with a long demo area name: the names stay short, so no name is cut.
- A visitor with no system color preference: the light still shows.
- The new scene makes the video longer than the earlier one: the caption's "in 3 minutes" stays true only if the video is 3 minutes and 30 seconds or shorter; else the caption changes.
- A frame between two scenes shows blank paper: the review finds it, and the video is recorded again.

## Assumptions
- The demo data: the demo repo `notes` and two or three more invented demo repos in `/Users/Shared/spec-studio-demo/`, put in two or three invented areas with neutral names. The demo project has an invented name, two or more milestones and a spec that waits for another spec.
- The guide shows two stills: the sidebar with colored areas, and the project view. The folded area goes in the video only.
- The guide stills are WebP files in `static/`. The guide Markdown marks a still with its light and dark versions, and the site renders a `<picture>` with a dark source, the same as the logo sketches.
- The scene shows the stills in turn (sidebar, folded area, project view), the same as the other scenes. It goes after the Priority scene and before the themes scene.
- The video stills are in `video/stills/` and use the dark theme, the same as the other scenes.
- The contact sheets are images in the scratchpad, not in the repo.
