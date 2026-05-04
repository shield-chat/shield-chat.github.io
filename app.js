const SUPABASE_URL = "https://wgicssoszlthhzsnkcys.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnaWNzc29zemx0aGh6c25rY3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTYyMzYsImV4cCI6MjA5MzQ3MjIzNn0.7Z4ak9BEU4YoQCL6ic967lVKgr9cb8EZArLasrhVan4";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let channel = "general";
let username = "User";

function setChannel(c) {
  channel = c;
  document.getElementById("channelName").innerText = c;
  loadMessages();
}

async function loadMessages() {
  const { data } = await client
    .from("messages")
    .select("*")
    .eq("channel", channel)
    .order("created_at", { ascending: true });

  const chat = document.getElementById("chat");
  chat.innerHTML = "";

  data.forEach(m => {
    chat.innerHTML += `
      <div class="msg">
        <b>${m.username}</b><br>
        ${m.content}
      </div>
    `;
  });

  chat.scrollTop = chat.scrollHeight;
}

async function send() {
  const input = document.getElementById("msg");
  if (!input.value.trim()) return;

  await client.from("messages").insert({
    username,
    channel,
    content: input.value
  });

  input.value = "";
}

function listen() {
  client
    .channel("chat")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      payload => {
        if (payload.new.channel === channel) {
          const chat = document.getElementById("chat");
          chat.innerHTML += `
            <div class="msg">
              <b>${payload.new.username}</b><br>
              ${payload.new.content}
            </div>
          `;
          chat.scrollTop = chat.scrollHeight;
        }
      }
    )
    .subscribe();
}

loadMessages();
listen();
