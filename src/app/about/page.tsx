export default function AboutPage() {
  return (
    <main className="pageContainer">
      <section>
        <h1>About the Project</h1>

        <p>
          The Phoneme Activity Builder is a frontend web application designed
          for Speech Pathology students and teachers to create phoneme-based
          classroom activities.
        </p>

        <p>
          Assessment 1 focuses on frontend design, usability, accessibility,
          responsive layout, and the generation of standalone classroom
          activities. Database-driven word management and more advanced
          activity generation are intended for later stages of the project.
        </p>
      </section>

      <section>
        <h2>Wordle Activity</h2>

        <p>
          The Wordle builder allows a teacher to configure a phoneme-based
          Wordle-style activity. Students use a phoneme keyboard to construct
          guesses and receive feedback showing whether each phoneme is correct,
          present in another position, or absent.
        </p>
      </section>

      <section>
        <h2>Word Search Activity</h2>

        <p>
          The Word Search activity presents a fixed set of phoneme-based words
          inside a classroom puzzle. Students select phonemes in sequence to
          identify the target words, with completed words highlighted and
          marked as found.
        </p>
      </section>

      <section>
        <h2>Student Details</h2>

        <p>
          <strong>Name:</strong> David Seelig
        </p>

        <p>
          <strong>Student Number:</strong> 22449870
        </p>
      </section>

      <section>
        <h2>Video Demonstration</h2>

        <p>
          The following video explains the design of the application and
          demonstrates how to create and use the Wordle and Word Search
          activities.
        </p>

        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "900px",
            aspectRatio: "16 / 9",
            margin: "24px auto 0",
          }}
        >
          <iframe
            src="YOUR_VIDEO_EMBED_URL"
            title="Phoneme Activity Builder demonstration"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
              borderRadius: "10px",
            }}
          />
        </div>
      </section>
    </main>
  );
}