<script setup>
definePageMeta({ middleware: "auth" });

const { data: user } = useAuth();
const route = useRoute();
const { data: projectData, refresh } = await useFetch(
  `/api/project/${route.params.id}`
);
const computedPercentageOfTasksDone = computed(() => {
  const tasks = projectData.value.tasks;
  const done = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const result = Math.round((done / total) * 100);
  return Number.isNaN(result) ? 0 : result;
});
let showModal = $ref(false);

let fileUrl = $ref("");
let fileTitle = $ref("");
const triggerFilesCreation = () => {
  showModal = {
    title: "Upload file",
    entity: "file",
  };
};
const submitFile = async () => {
  await $fetch(`/api/project/file`, {
    method: "POST",
    body: JSON.stringify({
      url: fileUrl,
      title: fileTitle,
      project_id: projectData.value.id,
    }),
  });
  await refresh();
  showModal = false;
  fileUrl = "";
  fileTitle = "";
};

// refactor later
let taskName = $ref("");
let taskDescription = $ref("");
let taskPriority = $ref("");
let taskDeadline = $ref("");
let taskAssignee = $ref("");
const submitTask = async () => {
  await $fetch(`/api/project/task`, {
    method: "POST",
    body: JSON.stringify({
      name: taskName,
      description: taskDescription,
      priority: taskPriority,
      deadline: taskDeadline,
      assignee: taskAssignee,
      project_id: projectData.value.id,
    }),
  });
  await refresh();
  showModal = false;
  taskName = "";
  taskDescription = "";
  taskPriority = "";
  taskDeadline = "";
  taskAssignee = "";
};

let userDoesNotExist = $ref(false);
const users = computed(() =>
  projectData.value.users.filter((u) => u?.id !== user.value?.id)
);
let userEmail = $ref("");
const submitUser = async () => {
  try {
    const user = await $fetch(`/api/project/user`, {
      method: "POST",
      body: JSON.stringify({
        email: userEmail,
        project_id: projectData.value.id,
      }),
    });
    await refresh();
    showModal = false;
  } catch (error) {
    userDoesNotExist = true;
    userEmail = "";
  }
};

const triggerTaskModal = () => {
  showModal = {
    title: "Create task",
    entity: "task",
  };
};
const triggerUserModal = () => {
  showModal = {
    title: "Add member",
    entity: "user",
  };
};
const taskComplete = async (task_id) => {
  await $fetch(`/api/project/complete-task`, {
    method: "PUT",
    body: JSON.stringify({
      task_id,
    }),
  });
  await refresh();
};
</script>
<template>
  <main class="p-16 bg-white dark:bg-gray-900" style="min-height: inherit">
    <div>
      <h1
        class="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-gray-200 md:text-4xl lg:text-5xl"
      >
        {{ projectData.name }}
      </h1>
      <span
        class="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
      >
        Deadline {{ new Date(projectData.deadline).toLocaleDateString() }}
      </span>
    </div>
    <section class="my-12 flex flex-wrap gap-12 lg:gap-24">
      <Widget title="Project Tasks" @onCreation="triggerTaskModal">
        <template #content>
          <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
            <li
              class="py-3 sm:py-4"
              v-for="task in projectData.tasks"
              :key="task.id"
            >
              <div class="flex items-center space-x-4">
                <div class="flex-1 min-w-0">
                  <p
                    class="text-sm font-medium text-gray-900 truncate dark:text-white"
                  >
                    {{ task.name }}
                  </p>
                  <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                    {{ users.find((u) => u.id === task.user_id).name }}
                  </p>
                </div>
                <span
                  v-if="task.status === 'incomplete'"
                  class="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300"
                  >{{ task.status }}</span
                >
                <span
                  v-if="task.status === 'done'"
                  class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300"
                  >{{ task.status }}</span
                >
              </div>
            </li>
          </ul>
        </template>
      </Widget>
      <Widget title="Members" @onCreation="triggerUserModal">
        <template #content>
          <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
            <li class="py-3 sm:py-4" v-for="u in users" :key="u.id">
              <div class="flex items-center space-x-4">
                <div class="flex-1 min-w-0">
                  <p
                    class="text-sm font-medium text-gray-900 truncate dark:text-white"
                  >
                    {{ u.name }}
                  </p>
                  <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                    {{ u.email }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </template>
      </Widget>
      <Widget title="Files" @onCreation="triggerFilesCreation">
        <template #content>
          <ul
            role="list"
            class="divide-y divide-gray-200 dark:divide-gray-700 flex flex-wrap gap-4 items-start"
          >
            <button
              class="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
              @click="navigateTo(link.url)"
              v-for="link in projectData.files"
              :key="link.id"
            >
              {{ link.name }}
            </button>
          </ul>
        </template>
      </Widget>
      <Widget title="Your Tasks" :add="false">
        <template #content>
          <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
            <li
              class="py-3 sm:py-4"
              v-for="task in projectData.tasks.filter(
                (e) => e.user_id === user.user.id && e.status === 'incomplete'
              )"
              :key="task.id"
            >
              <div class="flex items-center space-x-4">
                <div class="flex-1 min-w-0">
                  <p
                    class="text-sm font-medium text-gray-900 truncate dark:text-white"
                  >
                    {{ task.name }}
                  </p>
                  <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                    {{ users.find((u) => u.id === task.user_id).name }}
                  </p>
                </div>

                <div class="flex items-center mr-4">
                  <input
                    @change="taskComplete(task.id)"
                    id="green-checkbox"
                    type="checkbox"
                    value=""
                    class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    for="green-checkbox"
                    class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >Done</label
                  >
                </div>
              </div>
            </li>
          </ul>
        </template>
      </Widget>
      <Widget title="Progress so far" :add="false">
        <template #content>
          <div class="w-full bg-gray-200 rounded-full dark:bg-gray-700">
            <div
              class="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
              :style="`width: ${computedPercentageOfTasksDone}%`"
            >
              {{ computedPercentageOfTasksDone }}%
            </div>
          </div>
        </template>
      </Widget>
    </section>
    <div
      v-show="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50"
    >
      <div class="relative w-full max-w-2xl max-h-full">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <!-- Modal header -->
          <div
            class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600"
          >
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ showModal.title }}
            </h3>
            <button
              type="button"
              @click="showModal = false"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                aria-hidden="true"
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <!-- Modal body -->
          <form
            class="p-6 space-y-6"
            @submit.prevent="submitTask"
            v-if="showModal.entity === 'task'"
          >
            <div class="mb-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Title</label
              >
              <input
                v-model="taskName"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
            <div class="mb-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Description</label
              >
              <input
                v-model="taskDescription"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
            <div class="mb-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Priority</label
              >
              <select
                v-model="taskPriority"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div class="mb-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Deadline</label
              >
              <input
                type="date"
                v-model="taskDeadline"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
            <div class="mb-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Who should do it?</label
              >
              <select
                v-model="taskAssignee"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              >
                <option v-for="u in users" :key="u.id" :value="u.email">
                  {{ u.name }}
                </option>
              </select>
            </div>
            <button
              type="submit"
              :disabled="
                !taskDeadline || !taskName || !taskDescription || !taskPriority
              "
              class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Add
            </button>
          </form>
          <form
            @submit.prevent="submitUser"
            class="p-6 space-y-6"
            v-if="showModal.entity === 'user'"
          >
            <div class="mb-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Email</label
              >
              <input
                type="email"
                v-model="userEmail"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
            <span
              v-if="userDoesNotExist"
              class="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300"
              >User doesn't exist</span
            >

            <button
              type="submit"
              :disabled="!userEmail"
              class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Add to project
            </button>
          </form>
          <form
            @submit.prevent="submitFile"
            class="p-6 space-y-6"
            v-if="showModal.entity === 'file'"
          >
            <div class="mb-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Title</label
              >
              <input
                v-model="fileTitle"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
            <div class="mb-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >URL</label
              >
              <input
                type="url"
                v-model="fileUrl"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>

            <button
              type="submit"
              :disabled="!fileTitle || !fileUrl"
              class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Add file
            </button>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>
