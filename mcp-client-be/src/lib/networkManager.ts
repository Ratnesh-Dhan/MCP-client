import { getUserSettings, updateModel, updateNetwork } from "../db/queries.js";

class NetworkManager {
  private network = "";
  private model = "";

  async load() {
    const settings = await getUserSettings();
    if (settings.length > 0) {
      this.network = settings[0].modelNetwork;
      this.model = settings[0].modelName ?? "";
    }
  }

  getNetwork() {
    return this.network;
  }

  getModel() {
    return this.model;
  }

  async updateNetwork(network: string) {
    const result = await updateNetwork(network);
    this.network = network;
    this.model = "";
    return result;
  }

  async updateModel(model: string) {
    const result = await updateModel({
      modelNetwork: this.network,
      modelName: model,
    });
    this.model = model;
    return result;
  }
}

export const networkManager = new NetworkManager();
