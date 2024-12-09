import axios from "@/setup/axios.setup";
import { getFullApiUrl, apiRequest } from "@/utils/api.utils";

export default class V3Services {
  constructor() {
    this.basePath = "v3";
  }

  /**
   * Logs in a user by sending their credentials to the login endpoint.
   */
  async login(userData) {
    return await apiRequest("post", this.basePath, "login", userData);
  }

  async getSectionGrouping() {
    try {
      return await apiRequest("get", this.basePath, "dropdown");
    } catch (error) {
      console.error(
        "Error fetching section grouping:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getStudentsBySection(id) {
    try {
      return await apiRequest("get", this.basePath, `list/${id}`);
    } catch (error) {
      console.error(
        "Error fetching section grouping:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async buzz(payload) {
    return await apiRequest("post", this.basePath, "buzz", payload);
  }

  async resetBuzzerState() {
    return await apiRequest("post", this.basePath, "reset");
  }

  async logout(data) {
    return await apiRequest("post", this.basePath, "logout", data);
  }

  async logoutAll(data) {
    return await apiRequest("post", this.basePath, "logout-all", data);
  }

  async awardScore(data) {
    return await apiRequest("post", this.basePath, "award", data);
  }

  async getFile() {
    return await apiRequest("get", this.basePath, "files");
  }

  async getFile(token) {
    try {
      const response = await axios.get(getFullApiUrl(this.basePath, "files"), {
        responseType: "blob",
      });

      if (response.status === 200) {
        const contentDisposition = response.headers["content-disposition"];
        let fileName = "guide.pdf";

        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
          if (fileNameMatch && fileNameMatch.length === 2) {
            fileName = fileNameMatch[1];
          }
        }

        const url = window.URL.createObjectURL(
          new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          })
        );

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return "Download successful";
      } else {
        console.error("Error: Unable to download the template.");
        return "Error: Unable to download template.";
      }
    } catch (error) {
      console.error("Error downloading the Excel template: ", error);
      throw error;
    }
  }

  async getActivities() {
    try {
      return await apiRequest("get", this.basePath, "activities");
    } catch (error) {
      console.error(
        "Error fetching section grouping:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getUserActivities(userId) {
    try {
      return await apiRequest(
        "get",
        this.basePath,
        `user-activities/${userId}`
      );
    } catch (error) {
      console.error(
        "Error fetching section grouping:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async markAsDone(data) {
    try {
      // Make the API request
      const response = await apiRequest(
        "post",
        this.basePath,
        "mark-as-done",
        data
      );

      // Return the response object so it can be used in the component
      return response;
    } catch (error) {
      console.error(
        "Error occurred while marking the activity as done:",
        error
      );
      throw error; // Rethrow to be caught in the component
    }
  }

  async unmarkAsDone(data) {
    try {
      // Make the API request
      const response = await apiRequest(
        "post",
        this.basePath,
        "unmark-as-done",
        data
      );

      // Return the response object so it can be used in the component
      return response;
    } catch (error) {
      console.error(
        "Error occurred while unmarking the activity as done:",
        error
      );
      throw error; // Rethrow to be caught in the component
    }
  }

  async requestForHelp(data) {
    try {
      // Make the API request
      const response = await apiRequest("post", this.basePath, "help", data);

      // Return the response object so it can be used in the component
      return response;
    } catch (error) {
      console.error(
        "Error occurred while marking the activity as done:",
        error
      );
      throw error; // Rethrow to be caught in the component
    }
  }

  async cancelRequestForHelp(data) {
    try {
      // Make the API request
      const response = await apiRequest(
        "post",
        this.basePath,
        "cancel-help",
        data
      );

      // Return the response object so it can be used in the component
      return response;
    } catch (error) {
      console.error(
        "Error occurred while marking the activity as done:",
        error
      );
      throw error; // Rethrow to be caught in the component
    }
  }
}
