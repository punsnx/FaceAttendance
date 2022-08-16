const vuetify = Vuetify.createVuetify();
const app = Vue.createApp({
  data() {
    return {
      dataOfUser: "",
      selectClass: "",
      selectRoom: "",
      classItems: [],
      roomItems: [],
      searchStudentList: "",
      date: "0000-00-00",
      showHistory: false,
      loading: false,
      user: {
        username: "<%= user.username%>",
        email: "<%= user.email%>",
        firstname: "<%= user.firstname%>",
        lastname: "<%= user.lastname%>",
        class: "<%= user.class%>",
        room: "<%= user.room%>",
        no: "<%= user.no%>",
        role: "<%= user.role%>",
        password: "",
      },
    };
  },
  mounted: function () {
    //method1 will execute at pageload
    this.getInitDataPage();
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 500);
  },
  methods: {
    getInitDataPage() {
      fetch("/process/get/dataOfUser/<%= user.studentID%>", {
        method: "POST",
      })
        .then((res) => res.json())
        .then((datares) => {
          this.dataOfUser = datares.dataOfUser;
        })
        .catch((err) => {
          console.error("Error: ", err);
        });
      fetch("/process/get/classitems", { method: "POST" })
        .then((res) => res.json())
        .then((datares) => {
          this.classItems = datares.classitems;
        })
        .catch((err) => {
          console.error("Error: ", err);
        });
    },
    computeRoomItem() {
      this.roomItems = [];
      this.selectRoom = "";
      if (this.selectClass != "") {
        for (x in this.selectClass.room) {
          this.roomItems.push({ room: x });
        }
      }
    },
    actionSubmit() {
      const urlf = `/process/get/datahistory/studentlist/${this.selectClass.class}/${this.selectRoom.room}/${this.date}`;
      fetch(urlf, { method: "POST" })
        .then((res) => res.json())
        .then((datares) => {
          this.searchStudentList = datares.studentList;
        })
        .catch((err) => {
          console.error("Error: ", err);
        });
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 500);
    },
    clearFilter() {
      this.selectClass = "";
      this.selectRoom = "";
      this.roomItems = [];
      this.searchStudentList = "";
      this.date = "0000-00-00";
    },
  },
});

app.use(vuetify).mount("#app");
